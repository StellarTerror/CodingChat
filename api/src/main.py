from multiprocessing import connection
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import binascii
import uuid
from pydantic import BaseModel

app = FastAPI()

# CORSを回避するための設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/hello")
def hello():
    return "Hello World"

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.full_text = ""
    
    def __len__(self):
        return len(self.active_connections)
    
    def set_full_text(self, text: str):
        self.full_text = text

    async def connect(self, websocket: WebSocket, name):
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.broadcast(json.dumps({"name": binascii.unhexlify(name).decode('utf-8'), "key": self.get_key(websocket), "type": "connect", "data": self.full_text}))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
    
    async def broadcast_except_me(self, message: str, websocket: WebSocket):
        for connection in self.active_connections:
            if connection != websocket:
                await connection.send_text(message)

    def get_key(self, websocket: WebSocket):
        return websocket.headers.get('sec-websocket-key')

managers = {}
is_public = {}
name = {}

class CreateRoom(BaseModel):
    name: str
    is_public: bool

class RoomInfo(BaseModel):
    name: str
    is_open: bool
    connections: int
    room_id: str

@app.post("/create_room", response_model=str)
async def create_room(room: CreateRoom):
    clean_keys = []
    for room_id in managers:
        if len(managers[room_id]) == 0:
            clean_keys.append(room_id)
    for key in clean_keys:
        managers.pop(key)
        is_public.pop(key)
        name.pop(key)
    room_id = str(uuid.uuid4())
    managers[room_id] = ConnectionManager()
    is_public[room_id] = room.is_public
    name[room_id] = room.name
    return room_id

@app.get("/room_info/{room_id}", response_model=RoomInfo)
async def room_info(room_id: str):
    try:
        return RoomInfo(name=name[room_id], is_open=is_public[room_id], room_id=room_id, connections=len(managers[room_id]))
    except KeyError:
        raise HTTPException(404, "Room not found")

@app.get("/room_list", response_model=List[RoomInfo])
async def room_list():
    return list(filter(lambda x: x.is_open is True, [RoomInfo(name=name[room_id], is_open=is_public[room_id], room_id=room_id, connections=len(managers[room_id])) for room_id in managers]))

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, name: str = "Anonymous"):
    print(room_id)
    manager = None
    try:
        manager = managers[room_id]
    except KeyError:
        raise HTTPException(404, "Room not found")

    await manager.connect(websocket, name)
    try:
        while True:
            data = await websocket.receive_text()
            data_json = json.loads(data)

            if data_json["type"] == "chat":
                await manager.broadcast(json.dumps({"name": binascii.unhexlify(name).decode('utf-8'), "key": manager.get_key(websocket), "type": "chat", "data": data_json["data"]}))
            
            elif data_json["type"] == "cursormove":
                await manager.broadcast_except_me(json.dumps({"name": binascii.unhexlify(name).decode('utf-8'), "key": manager.get_key(websocket), "type": "cursormove", "data": data_json["data"]}), websocket)

            elif data_json["type"] == "selection":
                await manager.broadcast_except_me(json.dumps({"name": binascii.unhexlify(name).decode('utf-8'), "key": manager.get_key(websocket), "type": "selection", "data": data_json["data"]}), websocket)
            
            elif data_json["type"] == "edit":
                manager.set_full_text(data_json["data"]["full_text"])
                await manager.broadcast_except_me(json.dumps({"name": binascii.unhexlify(name).decode('utf-8'), "key": manager.get_key(websocket), "type": "edit", "data": data_json["data"]}), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({"name": binascii.unhexlify(name).decode('utf-8'), "key": manager.get_key(websocket), "type": "disconnect", "data": ""}))