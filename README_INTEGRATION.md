# AI CLI Integration - Prompt UI Toolbox

This document describes the integration of Claude Code and Gemini CLI into the Prompt UI Toolbox, including setup instructions, usage, and known limitations.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Claude API key from [Anthropic Console](https://console.anthropic.com/)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd prompt-ui-toolbox-main

# Set your API keys
export ANTHROPIC_API_KEY="your-claude-api-key"
export GEMINI_API_KEY="your-gemini-api-key"

# Build and run
docker compose up --build
```

### Access the Application
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- Claude Agent: http://localhost:9003
- Gemini Agent: http://localhost:9004

## 🎯 Features

### ✅ Working Features
- **Docker Integration**: Both AI tools running in containers
- **HTTP API**: Direct agent communication via REST endpoints
- **Multi-Agent Chat**: Reliable AI interactions in chat interface
- **CLI Tools**: Available in backend container for direct execution

### ⚠️ Known Limitations
- **TerminalPane**: Embedded terminals show empty responses for CLI commands
- **Windows Compatibility**: PTY implementation has buffering issues
- **Interactive Mode**: Some CLI features require workarounds

## 📖 Usage Guide

### Method 1: Multi-Agent Chat (Recommended)
Use the chat interface for reliable AI interactions:
1. Open the Multi-Agent Chat panel
2. Select "Claude" or "Gemini" agent
3. Type your prompt and press Enter
4. Receive immediate AI responses

### Method 2: Direct Docker Execution
Run CLI tools directly in Docker containers:
```bash
# Claude commands
docker exec prompt-ui-toolbox-main-backend-1 claude --print "write a Python function"

# Gemini commands
docker exec prompt-ui-toolbox-main-backend-1 gemini --prompt "explain Docker containers"
```

### Method 3: HTTP API Calls
Use REST endpoints for programmatic access:
```bash
# Claude API
curl -X POST http://localhost:9003/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "write a simple function"}'

# Gemini API
curl -X POST http://localhost:9004/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "explain TypeScript"}'
```

### Method 4: Terminal Pane (Limited)
⚠️ **Note**: Currently shows empty responses on Windows
```bash
# These may not show output in embedded terminals
claude --print "hello world"
gemini --prompt "hello world"
```

## 🛠 Troubleshooting

### Common Issues

**Problem**: Commands show no output in terminal panes
**Solution**: Use Multi-Agent Chat or direct Docker execution

**Problem**: API key errors
**Solution**: Verify environment variables are set:
```bash
echo $ANTHROPIC_API_KEY
echo $GEMINI_API_KEY
```

**Problem**: Container startup issues
**Solution**: Check logs and restart:
```bash
docker compose logs backend
docker compose restart backend
```

**Problem**: WebSocket connection errors
**Solution**: Refresh browser and check backend status

### Debug Commands
```bash
# Check container status
docker compose ps

# View backend logs
docker compose logs backend --tail 20

# Test CLI tools
docker exec prompt-ui-toolbox-main-backend-1 claude --help
docker exec prompt-ui-toolbox-main-backend-1 gemini --help

# Check API endpoints
curl http://localhost:8000/
curl http://localhost:9003/
curl http://localhost:9004/
```

## 🏗 Architecture

### Services Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Agents     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Docker)      │
│                 │    │                 │    │                 │
│ - TerminalPane  │    │ - WebSocket     │    │ - Claude Agent  │
│ - Multi-Agent   │    │ - Shell Manager │    │ - Gemini Agent  │
│   Chat          │    │ - Agent Manager │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components
- **Frontend**: React app with xterm.js terminals and chat interface
- **Backend**: FastAPI server with WebSocket support
- **Shell Manager**: PTY-based shell session management
- **Agent Manager**: HTTP communication with AI services
- **AI Agents**: Docker containers running CLI tools

## 🔄 Development

### Adding New AI Tools
1. Create agent directory: `agent-{toolname}/`
2. Add Dockerfile with tool installation
3. Create agent_service.js for HTTP endpoint
4. Update docker-compose.yml
5. Add to remote_agent_manager.py

### Testing Changes
```bash
# Rebuild specific service
docker compose build backend

# Restart services
docker compose restart

# View real-time logs
docker compose logs -f backend
```

## 📚 API Reference

### WebSocket Endpoints
- `/ws/{agent_name}` - Agent communication
- `/ws-shell/{session_key}` - Terminal sessions

### HTTP Endpoints
- `GET /` - Backend status
- `POST /agent-claude/execute` - Claude API
- `POST /agent-gemini/execute` - Gemini API

### Environment Variables
- `ANTHROPIC_API_KEY` - Claude API key
- `GEMINI_API_KEY` - Gemini API key
- `USE_REMOTE_AGENTS` - Enable agent communication

## 🚧 Future Improvements

### Planned Enhancements
1. **WebTTY Integration**: Replace current shell with true PTY proxy
2. **Cross-Platform Support**: Native PTY for Windows hosts
3. **Enhanced Error Handling**: Better timeout and recovery mechanisms
4. **User Documentation**: Comprehensive usage guides

### Known Issues to Address
- [ ] TerminalPane empty responses on Windows
- [ ] Interactive CLI session handling
- [ ] PTY buffering and timeout issues
- [ ] Cross-platform compatibility

## 📄 License

This integration follows the same license as the main Prompt UI Toolbox project.

## 🤝 Contributing

For issues related to AI integration:
1. Check existing issues in the repository
2. Create new issue with detailed description
3. Include logs and error messages
4. Specify platform and environment details

---

**Last Updated**: December 2024  
**Status**: Functional with known limitations  
**Version**: 1.0.0 