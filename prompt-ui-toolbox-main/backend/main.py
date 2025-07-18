from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import asyncio
import sys

# Ensure subprocess support on Windows
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = FastAPI(title="Multi-Agent Collab Coding Backend")

# Allow CORS for development; adjust origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()

USE_REMOTE = os.getenv("USE_REMOTE_AGENTS", "0") == "1"

if USE_REMOTE:
    from remote_agent_manager import manager as agent_manager  # type: ignore
else:
    from agent_manager import manager as agent_manager

from shell_manager import manager as shell_manager


@app.on_event("startup")
async def startup_event():
    # Start all agents when the application boots.
    await agent_manager.start_all()


@app.get("/")
async def root():
    return {"status": "Backend is running"}


@app.websocket("/ws/{agent_name}")
async def websocket_agent(websocket: WebSocket, agent_name: str):
    """Interactive WebSocket per agent for sending commands and receiving output."""
    if agent_name not in {"pm", "frontend", "backend"}:
        await websocket.close(code=1008)  # policy violation
        return

    await manager.connect(websocket)

    # Fan out agent output to this websocket.
    agent_task = None
    if not USE_REMOTE:
        async def agent_to_ws():
            try:
                async for line in agent_manager.subscribe(agent_name):  # type: ignore[misc]
                    await websocket.send_text(line)
            except Exception:
                pass  # Connection closure handled below

        agent_task = asyncio.create_task(agent_to_ws())
    try:
        while True:
            data = await websocket.receive_text()
            if USE_REMOTE:
                response = await agent_manager.send(agent_name, data)
                await websocket.send_text(str(response))
            else:
                await agent_manager.send(agent_name, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        if agent_task:
            agent_task.cancel()


@app.websocket("/ws-shell/{session_key}")
async def websocket_shell(websocket: WebSocket, session_key: str):
    await manager.connect(websocket)
    shell = await shell_manager.get_session(session_key)

    async def pump():
        async for line in shell.stream():
            await websocket.send_text(line)
    pump_task = asyncio.create_task(pump())
    try:
        while True:
            data = await websocket.receive_text()
            await shell.write(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        pump_task.cancel()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 