import asyncio
import sys
import subprocess
import threading
from typing import Dict, List, Optional, Any


class AgentProcess:
    """Represents a running AI agent process and streams its stdout."""

    def __init__(self, name: str, command: List[str]):
        self.name = name
        self.command = command
        self.process: Optional[Any] = None  # Can be asyncio.subprocess.Process or subprocess.Popen
        self.output_queue: "asyncio.Queue[str]" = asyncio.Queue()

    async def start(self):
        """Start the subprocess and begin reading its output. Falls back to a threaded
        approach on Windows when the current event loop does not support
        subprocesses (e.g., ProactorEventLoop)."""

        if self.process is not None:
            return  # already running

        try:
            # Preferred async subprocess (works on SelectorEventLoop / Unix)
            self.process = await asyncio.create_subprocess_exec(
                *self.command,
                stdout=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            asyncio.create_task(self._read_stdout())
        except NotImplementedError:
            # Fallback for Windows Proactor loop
            loop = asyncio.get_running_loop()

            # Use blocking subprocess.Popen in a background thread
            self.process = subprocess.Popen(
                self.command,
                stdout=subprocess.PIPE,
                stdin=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )

            def _reader():
                assert self.process and self.process.stdout
                for line in self.process.stdout:
                    asyncio.run_coroutine_threadsafe(
                        self.output_queue.put(line.rstrip()), loop
                    )

            threading.Thread(target=_reader, daemon=True).start()

    async def _read_stdout(self):
        assert self.process and self.process.stdout
        while True:
            line = await self.process.stdout.readline()
            if not line:
                break
            await self.output_queue.put(line.decode().rstrip())

    async def send_input(self, text: str):
        if not self.process or not self.process.stdin:
            return

        from asyncio import StreamWriter  # local import to avoid circular type issues
        if isinstance(self.process.stdin, StreamWriter):
            # Async writer (Selector loop / Unix)
            self.process.stdin.write((text + "\n").encode())
            await self.process.stdin.drain()
        else:
            # Blocking writer fallback
            self.process.stdin.write(text + "\n")
            await asyncio.get_running_loop().run_in_executor(
                None, self.process.stdin.flush
            )

    async def stop(self):
        if self.process:
            self.process.terminate()
            await self.process.wait()
            self.process = None


class AgentManager:
    """Starts and manages multiple agent subprocesses."""

    def __init__(self):
        # Placeholder commands that simply echo input. Replace with real Gemini/Claude invocations.
        echo_script = (
            "python",
            "-u",
            "-c",
            (
                "import sys, time; "
                "print('Agent ready', flush=True); "
                "\n"  # newline for readability
                "for line in sys.stdin: print(f'ECHO: {line.strip()}', flush=True)"
            ),
        )
        self.agents: Dict[str, AgentProcess] = {
            "pm": AgentProcess("pm", list(echo_script)),
            "frontend": AgentProcess("frontend", list(echo_script)),
            "backend": AgentProcess("backend", list(echo_script)),
        }

    async def start_all(self):
        await asyncio.gather(*(agent.start() for agent in self.agents.values()))

    async def send(self, agent_name: str, text: str):
        agent = self.agents.get(agent_name)
        if agent:
            await agent.send_input(text)

    async def subscribe(self, agent_name: str):
        """Async generator yielding lines from the agent's output queue."""
        agent = self.agents.get(agent_name)
        if not agent:
            raise ValueError(f"Unknown agent {agent_name}")
        while True:
            line = await agent.output_queue.get()
            yield line

    async def stop_all(self):
        await asyncio.gather(*(agent.stop() for agent in self.agents.values()))


# Convenience singleton
manager = AgentManager() 