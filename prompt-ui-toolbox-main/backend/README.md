# Backend Service

## Development

Install dependencies:

```bash
pip install -r requirements.txt
```

### Running on Windows
Due to Windows defaulting to the Proactor event loop (which doesn’t support `asyncio` subprocesses), use the helper script which switches to the `Selector` loop. Note that hot-reload is disabled on Windows for this reason.

```bash
python run_server.py
```

### Running on Unix/macOS
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000/` and WebSocket endpoints at `ws://localhost:8000/ws/{agent_name}` where `{agent_name}` is `pm`, `frontend`, or `backend`. 

────────────────────────────────────────
1. Supply API keys in the new Settings gear
────────────────────────────────────────
• Open the wheel → paste your Anthropic and/or Gemini keys → Save.  
  The keys are stored in `localStorage` for the frontend; we’ll read them inside the agent containers next.

────────────────────────────────────────
2. Replace an echo agent with a real model
────────────────────────────────────────
A. Create a directory `agent-claude/` (or `agent-gemini/`) with:

Dockerfile
```dockerfile
FROM node:20-alpine           # lightweight
WORKDIR /app
RUN npm install -g @anthropic-ai/claude-code   # or gemini-cli
COPY agent_service.js .
ENV PORT=9000
CMD ["node", "agent_service.js"]
```

agent_service.js
```js
import express from "express";
import { spawn } from "child_process";

const PORT = process.env.PORT || 9000;
const app  = express();
app.use(express.json());

app.post("/execute", async (req, res) => {
  const prompt = req.body?.input ?? "";
  const key    = req.body?.apiKey;           // sent from frontend

  const env    = { ...process.env, ANTHROPIC_API_KEY: key };  // inject secret
  const child  = spawn("claude-code", ["--no-color"], { env, stdio: ["pipe", "pipe", "pipe"] });

  let out = "";
  child.stdout.on("data", d => (out += d));
  child.stderr.on("data", d => (out += d));

  child.stdin.write(prompt + "\n");
  child.stdin.end();
  child.on("close", () => res.json({ output: out.trim() }));
});

app.listen(PORT, () => console.log("Claude agent ready on", PORT));
```

B. Update docker-compose.yml

```yaml
services:
  agent-claude:
    build: ./agent-claude
    ports: ["9003:9000"]
  backend:
    environment:
      - AGENT_CLAUDE_URL=http://agent-claude:9000
```

C. Teach backend about the new agent (`remote_agent_manager.py`):

```python
"claude": os.getenv("AGENT_CLAUDE_URL", "http://localhost:9003"),
```

────────────────────────────────────────
3. Send the key from the frontend
────────────────────────────────────────
Modify `remote_agent_manager.send` to POST both the user’s text and their stored key:

```python
payload = {"input": text, "apiKey": os.getenv("ANTHROPIC_API_KEY", "")}
resp = await client.post(f"{url}/execute", json=payload)
```

Quick way: in SettingsModal, after saving, push the key into `window`:

```ts
window.__ANTHROPIC_KEY__ = anthropicKey;
```

Then adjust the WebSocket client (`ChatPane`) to prepend the key to the user’s text or send a small JSON object—your choice.

────────────────────────────────────────
4. Rebuild & run
────────────────────────────────────────
```bash
docker compose down
docker compose up --build
```
Open chat pane for `claude` (`ws://localhost:8000/ws/claude`) and you should get real answers.

────────────────────────────────────────
5. Polish
────────────────────────────────────────
• Stream output token-by-token: upgrade `/execute` to Server-Sent-Events and pipe them through backend → WebSocket.  
• Store keys in browser’s indexedDB or an encrypted backend vault for better security.  
• Add agent-selection dropdown so any pane can switch model on the fly.  
• Implement MCP protocol logic (tasks, context sharing) once basic chat works.

Follow these steps incrementally—first prove you can get *one* agent answering with real code, then replicate for the other two panes.  Each layer (frontend → backend → agent container) stays small and testable. 