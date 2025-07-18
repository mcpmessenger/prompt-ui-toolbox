from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI(title="AI Agent Echo Service")


class Command(BaseModel):
    input: str


@app.post("/execute")
async def execute(cmd: Command):
    agent_name = os.getenv("AGENT_NAME", "agent")
    return {"output": f"{agent_name.upper()} ECHO: {cmd.input}"} 