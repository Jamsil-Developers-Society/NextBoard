# server/signaling_server.py
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 모든 origin 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connections = []  # 연결된 WebSocket 목록

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received from client: {data[:100]}...")  # 일부만 출력
            # 나를 제외한 다른 클라이언트에게 중계
            for conn in connections:
                if conn != websocket:
                    await conn.send_text(data)
    except WebSocketDisconnect:
        connections.remove(websocket)
