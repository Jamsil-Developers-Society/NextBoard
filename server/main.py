import sqlite3
import asyncio
import json
import traceback
from datetime import datetime
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from DB import initialize_database, insert_user, get_user_by_login_id

DB_FILE = "data/chat_server.db"

# ----------------------------
# ChatRoom 클래스
# ----------------------------
class ChatRoom:
    def __init__(self, room_id):
        self.room_id = room_id
        self.members = set()
        self.host_user_id = None

    def join(self, session):
        self.members.add(session)
        print(f"[ROOM {self.room_id}] '{session.user_name}' (user_id={session.user_id}) joined.")
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


# ----------------------------
# ChatSession (FastAPI 용)
# ✅ 수정
# ----------------------------
class ChatSessionFastAPI:
    def __init__(self, websocket: WebSocket, user_id, user_name, room):
        self.websocket = websocket
        self.user_id = user_id
        self.user_name = user_name
        self.room = room

    async def send_message(self, message):
        try:
            await self.websocket.send_text(message)
        except Exception as e:
            print(f"Send error: {e}")

    async def handle(self):
        #await self.websocket.accept()  # ✅ FastAPI 연결 수락
        self.room.join(self)
        try:
            while True:
                message = await self.websocket.receive_text()
                await self.check_message(message)
        except WebSocketDisconnect:
            self.room.leave(self)

    async def check_message(self, message):
        try:
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

                elif command == "draw_board":
                     for member in self.room.members:
                        asyncio.create_task(member.send_message(message))

                else:
                    await self.send_message(f"Unknown command: {command}")
                    
            else:
                self.room.broadcast(self.user_name, message)
                self.room.save_message_to_db(self.user_id, message)

        except json.JSONDecodeError:
            self.room.broadcast(self.user_name, message)
            self.room.save_message_to_db(self.user_id, message)
        except Exception as e:
            await self.send_message(f"Error parsing message: {str(e)}")


# ----------------------------
# ChatServer
# ✅ 수정: FastAPI handler 추가
# ----------------------------

class ChatServer:
    def __init__(self):
        self.rooms = {}

    def _generate_new_room_id(self):
        return len(self.rooms)

    async def handler_fastapi(self, websocket: WebSocket):
        try:
            await websocket.accept()
            init_data = await websocket.receive_text()
            data = json.loads(init_data)

            user_id = int(data.get("user_id"))
            user_name = data.get("user_name")
            room_id_raw = data.get("room_id")

            # ✅ room_id 없으면 새로 만들고 입장까지 진행
            if room_id_raw is None:
                room_id = self._generate_new_room_id()
                self.rooms[room_id] = ChatRoom(room_id)

                await websocket.send_text(json.dumps({
                    "status": "created",
                    "room_id": room_id
                }))
            else:
                room_id = int(room_id_raw)
                if room_id not in self.rooms:
                    self.rooms[room_id] = ChatRoom(room_id)
                    status = "created"
                else:
                    status = "joined"

                await websocket.send_text(json.dumps({
                    "status": status,
                    "room_id": room_id
                }))

            # ✅ 입장 처리 (공통)
            room = self.rooms[room_id]
            session = ChatSessionFastAPI(websocket, user_id, user_name, room)
            await session.handle()

        except Exception as e:
            traceback.print_exc()
            print(f"Connection handler error: {e}")
            await websocket.close()



# class ChatServer:
#     def __init__(self):
#         self.rooms = {}

#     async def handler_fastapi(self, websocket: WebSocket):
#         try:
#             await websocket.accept()
#             init_data = await websocket.receive_text()
#             data = json.loads(init_data)
#             user_id = int(data.get("user_id"))
#             user_name = data.get("user_name")
#             room_id = int(data.get("room_id"))

#             if room_id not in self.rooms:
#                 self.rooms[room_id] = ChatRoom(room_id)
#             room = self.rooms[room_id]

#             session = ChatSessionFastAPI(websocket, user_id, user_name, room)
#             await session.handle()
#         except Exception as e:
#             traceback.print_exc()
#             print(f"Connection handler error: {e}")
#             await websocket.close()


# ----------------------------
# FastAPI 앱
# ----------------------------
initialize_database()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "hello, world!"}


# ----------------------------
# 회원가입 / 로그인 API
# ----------------------------
class UserSignup(BaseModel):
    login_id: str
    login_password: str
    name: str

class UserLogin(BaseModel):
    login_id: str
    login_password: str

@app.post("/signup")
async def signup(user: UserSignup):
    success = insert_user(user.login_id, user.login_password, user.name)
    if not success:
        raise HTTPException(status_code=400, detail="Login ID or Name already exists.")
    return {"message": "User created successfully."}

@app.post("/login")
async def login(user: UserLogin):
    db_user = get_user_by_login_id(user.login_id)
    if not db_user or db_user["login_password"] != user.login_password:
        raise HTTPException(status_code=401, detail="Invalid login credentials.")
    return {
        "id": db_user["id"],
        "name": db_user["name"]
    }


# ----------------------------
# WebSocket 엔드포인트
# ✅ 수정: 기존 connected_clients 제거
# ----------------------------
server_instance = ChatServer()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await server_instance.handler_fastapi(websocket)
