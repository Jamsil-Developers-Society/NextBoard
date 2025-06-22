from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from DB import initialize_database, insert_user, get_user_by_login_id

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
    return {"message": f"Welcome, {db_user['name']}!"}

connected_clients: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for client in connected_clients:
                if client != websocket:
                    await client.send_text(f"Message from other client: {data}")
    except WebSocketDisconnect:
        connected_clients.remove(websocket)