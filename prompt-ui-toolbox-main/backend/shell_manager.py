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
            "-i",
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
        """Read PTY output and forward every chunk to the WebSocket queue.

        Uses asyncio.StreamReader bound to the process stdout pipe so we
        retrieve data as soon as it is available (even without newlines)."""

        assert self.process and self.process.stdout
        loop = asyncio.get_running_loop()

        reader = asyncio.StreamReader()
        protocol = asyncio.StreamReaderProtocol(reader)
        # Connect the StreamReader to the subprocess stdout pipe
        await loop.connect_read_pipe(lambda: protocol, self.process.stdout)

        while True:
            data = await reader.read(1024)
            if not data:
                break  # EOF
            await self.queue.put(data.decode(errors="ignore"))

    async def write(self, text: str):
        if self.process and self.process.stdin:
            self.process.stdin.write(text.encode())
            await self.process.stdin.drain()

    async def stream(self) -> AsyncGenerator[str, None]:
        while True:
            line = await self.queue.get()
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