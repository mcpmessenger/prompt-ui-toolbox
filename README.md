# Multi-Agent Collaborative Coding Tool

A web-based development environment with multiple terminal panes and AI agent integration for collaborative coding projects.

## Features

- **Multi-Terminal Interface**: Three resizable terminal panes (Project Manager, Frontend, Backend)
- **Real-time Shell Access**: Interactive bash shells running in Docker containers
- **Theme Support**: Dark/light mode with automatic terminal color switching
- **AI Agent Integration**: Support for Claude and Gemini AI agents
- **WebSocket Communication**: Real-time bidirectional communication
- **Responsive Design**: Modern UI with resizable panels

## Current Challenge: Terminal Output Rendering

### Issue Description
The terminal panes were not displaying any output despite successful backend communication and frontend data reception. Commands were being sent and processed, but no visual output appeared in the xterm.js terminals.

### Root Cause
The primary issue was that xterm.js terminals were not properly sized or fitted to their containers. While `term.write()` calls were executing successfully, the terminal had zero dimensions or was hidden due to:
- Missing container dimensions
- CSS conflicts with Tailwind
- No automatic resizing mechanism

### Solution Implemented
1. **Added xterm-addon-fit**: Integrated `FitAddon` for automatic terminal sizing
2. **ResizeObserver**: Implemented dynamic resizing when containers change
3. **Minimum Dimensions**: Added `minWidth: "100px", minHeight: "100px"` to prevent zero-sized terminals
4. **Theme Synchronization**: Added `MutationObserver` to update terminal colors when theme changes
5. **Timeout Handling**: Added 5-second write timeouts and 30-second read timeouts to prevent hangs
6. **Process Recovery**: Automatic shell process restart if hanging or dead

### Technical Details
- **Package Added**: `xterm-addon-fit: ^0.7.0`
- **Theme Colors**: 
  - Dark mode: `#000000` background, `#ffffff` foreground
  - Light mode: `#ffffff` background, `#000000` foreground
- **Timeout Values**: 5s for writes, 30s for reads
- **Auto-restart**: Shell processes restart automatically if they hang

## Quick Start

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose V2)
- Node.js 18+ (for development)

### One-liner Setup
```bash
# from project root
docker compose up --build
```

### Manual Setup
1. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python run_server.py  # Windows
   # or
   uvicorn main:app --reload  # Unix/macOS
   ```

2. **Frontend Setup**:
   ```bash
   npm install
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000

## Architecture

### Components
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + WebSockets + asyncio
- **Terminals**: xterm.js with FitAddon for resizing
- **Agents**: Docker containers for AI model integration

### Terminal Sessions
Each terminal pane connects to a unique shell session:
- **Project Manager**: Session key "pm"
- **Frontend**: Session key "frontend" 
- **Backend**: Session key "backend"

### WebSocket Endpoints
- `/ws-shell/{session_key}`: Terminal shell communication
- `/ws/{agent_name}`: AI agent communication

## AI Agent Integration

### Current Agents
- **Echo Agents**: Placeholder agents that echo input (pm, frontend, backend)
- **Gemini Agent**: Available via `agent-gemini/` container
- **Claude Agent**: Available via `agent-claude/` container

### Adding Real AI Agents
1. **Create Agent Container**:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   RUN npm install -g @google/gemini-cli  # or @anthropic-ai/claude-code
   COPY agent_service.js .
   ENV PORT=9000
   CMD ["node", "agent_service.js"]
   ```

2. **Update docker-compose.yml**:
   ```yaml
   services:
     agent-gemini:
       build: ./agent-gemini
       ports: ["9004:9000"]
   ```

3. **Configure Backend**:
   - Add agent URL to `remote_agent_manager.py`
   - Set environment variables for API keys

## Development

### Project Structure
```
prompt-ui-toolbox-main/
├── src/
│   ├── components/
│   │   ├── TerminalPane.tsx      # Terminal component with xterm.js
│   │   ├── MultiAgentChat.tsx    # Main layout
│   │   └── ThemeToggle.tsx       # Theme switching
│   └── ...
├── backend/
│   ├── shell_manager.py          # Shell session management
│   ├── agent_manager.py          # AI agent management
│   └── main.py                   # FastAPI application
├── agent-gemini/                 # Gemini AI agent
├── agent/                        # Echo agent (placeholder)
└── docker-compose.yml           # Container orchestration
```

### Key Files
- **TerminalPane.tsx**: Main terminal component with xterm.js integration
- **shell_manager.py**: Shell process management with timeout handling
- **main.py**: WebSocket endpoints and routing
- **docker-compose.yml**: Container configuration

### Environment Variables
- `USE_REMOTE_AGENTS`: Set to "1" to use Docker agent containers
- `ANTHROPIC_API_KEY`: Claude API key
- `GEMINI_API_KEY`: Gemini API key

## Troubleshooting

### Terminal Not Responding
1. Check if shell process is hanging: refresh the page
2. Verify WebSocket connection in browser console
3. Check backend logs for shell process errors

### Commands Hanging
- Commands like `npm install` can take 30+ seconds
- Use timeouts to prevent indefinite hangs
- Shell processes auto-restart if they hang

### Theme Not Switching
- Terminal colors update automatically when theme changes
- If not working, refresh the page to reinitialize terminals

### AI Agents Not Working
1. Verify API keys are set in Settings
2. Check agent containers are running: `docker compose ps`
3. Test agent endpoints directly: `curl http://localhost:9004/execute`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially terminal functionality)
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **xterm.js**: Terminal emulator library
- **FastAPI**: Modern Python web framework
- **React**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework 