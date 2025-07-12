import sqlite3
import asyncio
import websockets 
import json
from datetime import datetime

DB_FILE = "data/chat_server.db"

class ChatRoom:
    def __init__(self, room_id):
        self.room_id = room_id
        self.members = set()
        self.host_user_id = None  # Optional

    def join(self, session):
        self.members.add(session)
        self.broadcast(session.user_name, "A new user has joined the chat.")

    def leave(self, session):
        self.members.discard(session)
        self.broadcast(session.user_name, "A user has left the chat.")

    def broadcast(self, user_name, message):
        for member in self.members:
            asyncio.create_task(member.send_message(f"{user_name}/{message}"))

    def save_message_to_db(self, user_id, message):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO talks (room_id, user_id, text, published_date)
            VALUES (?, ?, ?, ?)
            """,
            (self.room_id, user_id, message, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()

    def grant_host_to_db(self, target_user_id):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE rooms SET host_user_id = ? WHERE id = ?",
            (target_user_id, self.room_id)
        )
        conn.commit()
        conn.close()
        self.host_user_id = target_user_id

class ChatSession:
    def __init__(self, websocket, user_id, user_name, room):
        self.websocket = websocket
        self.user_id = user_id
        self.user_name = user_name
        self.room = room

    async def send_message(self, message):
        try:
            await self.websocket.send(message)
        except Exception as e:
            print(f"Send error: {e}")

    async def handle(self):
        self.room.join(self)
        try:
            async for message in self.websocket:
                await self.check_message(message)
        finally:
            self.room.leave(self)

    # async def check_message(self, message):
    #     try:
    #         command_data = json.loads(message)
    #         command = command_data.get("command")
    #         if command == "send_text":
    #             text = command_data.get("text")
    #             self.room.broadcast(self.user_name, text)
    #             self.room.save_message_to_db(self.user_id, text)
    #         elif command == "exit_room":
    #             self.room.leave(self)
    #         elif command == "grant_host":
    #             target_user_id = command_data.get("target_user_id")
    #             self.room.grant_host_to_db(target_user_id)
    #             self.room.leave(self)
    #         else:
    #             await self.send_message(f"Unknown command: {command}")
    #     except Exception as e:
    #         await self.send_message(f"Error parsing message: {str(e)}")

    async def check_message(self, message):
        try:
            # JSON 명령어가 아닐 경우 일반 메시지로 간주
            if message.startswith("{"):
                command_data = json.loads(message)
                command = command_data.get("command")
                
                if command == "send_text":
                    text = command_data.get("text")
                    self.room.broadcast(self.user_name, text)
                    self.room.save_message_to_db(self.user_id, text)
                
                elif command == "exit_room":
                    self.room.leave(self)
                
                elif command == "grant_host":
                    target_user_id = command_data.get("target_user_id")
                    self.room.grant_host_to_db(target_user_id)
                    self.room.leave(self)

                else:
                    await self.send_message(f"Unknown command: {command}")
            else:
                # 그냥 일반 문자열인 경우 메시지로 처리
                self.room.broadcast(self.user_name, message)
                self.room.save_message_to_db(self.user_id, message)

        except json.JSONDecodeError:
            # JSON 파싱 실패 시 일반 메시지로 처리
            self.room.broadcast(self.user_name, message)
            self.room.save_message_to_db(self.user_id, message)

        except Exception as e:
            await self.send_message(f"Error parsing message: {str(e)}")

class ChatServer:
    def __init__(self):
        self.rooms = {}

    async def handler(self, websocket):
        try:    
            init_data = await websocket.recv()
            data = json.loads(init_data)
            user_id = int(data.get("user_id"))
            user_name = data.get("user_name")
            room_id = int(data.get("room_id"))

            if room_id not in self.rooms:
                self.rooms[room_id] = ChatRoom(room_id)
            room = self.rooms[room_id]

            session = ChatSession(websocket, user_id, user_name, room)
            await session.handle()
        except Exception as e:
            print(f"Connection handler error: {e}")
            await websocket.close()


'''
if __name__ == "__main__":
    server = ChatServer()
    
    start_server = websockets.serve(server.handler, "localhost", 12345)
    print("Chat server is running on ws://localhost:12345")
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
'''
server_instance = ChatServer()

async def handler_wrapper(websocket):
    await server_instance.handler(websocket)

async def main():
    async with websockets.serve(handler_wrapper, "localhost", 12345):
        print("Chat server is running on ws://localhost:12345")
        await asyncio.Future()  # Keeps running

if __name__ == "__main__":
    asyncio.run(main())