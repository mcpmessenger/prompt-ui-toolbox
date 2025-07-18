import os
import asyncio
import httpx
from typing import Dict


class RemoteAgentManager:
    """Communicates with external agent services via HTTP."""

    def __init__(self):
        self.agent_urls: Dict[str, str] = {
            "pm": os.getenv("AGENT_PM_URL", "http://localhost:9000"),
            "frontend": os.getenv("AGENT_FRONTEND_URL", "http://localhost:9001"),
            "backend": os.getenv("AGENT_BACKEND_URL", "http://localhost:9002"),
            "gemini": os.getenv("AGENT_GEMINI_URL", "http://localhost:9004"),
        }

    async def start_all(self):
        # Nothing to start for remote agents, but keep API parity.
        return

    async def send(self, agent_name: str, text: str) -> str:
        url = self.agent_urls.get(agent_name)
        if not url:
            raise ValueError(f"Unknown agent {agent_name}")

        # attach API key if present in env vars
        payload = {"input": text}
        if agent_name == "claude":
            key = os.getenv("ANTHROPIC_API_KEY")
            if key:
                payload["apiKey"] = key
        elif agent_name == "gemini":
            key = os.getenv("GEMINI_API_KEY")
            if key:
                payload["apiKey"] = key

        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{url}/execute", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("output", "")

    async def subscribe(self, agent_name: str):
        """For now, we don't support streaming; emulate by polling .send."""
        raise NotImplementedError("Streaming not implemented for remote agents.")

    async def stop_all(self):
        return


manager = RemoteAgentManager() 