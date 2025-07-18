import asyncio
import os
from typing import Dict, Optional, AsyncGenerator

class ShellSession:
    def __init__(self, cmd: Optional[str] = None):
        self.cmd = cmd or ("/bin/bash" if os.path.exists("/bin/bash") else "/bin/sh")
        self.process: Optional[asyncio.subprocess.Process] = None
        self.queue: "asyncio.Queue[str]" = asyncio.Queue()
        self._bootstrapped = False

    async def start(self):
        if self.process is not None:
            return
        self.process = await asyncio.create_subprocess_exec(
            self.cmd,
            "-c", "echo 'Terminal ready'; exec bash",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        asyncio.create_task(self._read_stdout())
        # Optional: refresh command cache so binaries installed earlier are recognized
        if not self._bootstrapped:
            await self.write("hash -r\n")
            self._bootstrapped = True
        # removed automatic installs; users can install desired CLI manually per pane

    async def _read_stdout(self):
        """Read PTY output and forward every chunk to the WebSocket queue."""

        assert self.process and self.process.stdout
        
        while True:
            try:
                data = await self.process.stdout.read(1024)
                if not data:
                    break  # EOF
                print(f"DEBUG: Shell output: {repr(data.decode(errors='ignore'))}")  # Debug log
                await self.queue.put(data.decode(errors="ignore"))
            except Exception as e:
                print(f"DEBUG: Error reading stdout: {e}")
                break

    async def write(self, text: str):
        if self.process and self.process.stdin:
            print(f"DEBUG: Writing to shell: {repr(text)}")  # Debug log
            self.process.stdin.write(text.encode())
            await self.process.stdin.drain()

    async def stream(self) -> AsyncGenerator[str, None]:
        print(f"DEBUG: Stream started for shell session")  # Debug log
        while True:
            print(f"DEBUG: Waiting for queue data...")  # Debug log
            line = await self.queue.get()
            print(f"DEBUG: Got line from queue: {repr(line)}")  # Debug log
            yield line

class ShellManager:
    def __init__(self):
        self.sessions: Dict[str, ShellSession] = {}

    async def get_session(self, key: str) -> ShellSession:
        if key not in self.sessions:
            session = ShellSession()
            await session.start()
            self.sessions[key] = session
        return self.sessions[key]

manager = ShellManager() 