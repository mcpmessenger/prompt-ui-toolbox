# Claude Code & Gemini CLI Integration Findings

## 🎯 Project Overview
Successfully integrated Claude Code and Gemini CLI into the Prompt UI Toolbox, with Docker containerization and WebSocket communication. Both AI tools are functional but embedded TerminalPane has Windows compatibility limitations.

## ✅ What's Working

### Docker Integration
- **Claude Agent**: Running on port 9003 with `@anthropic-ai/claude-code`
- **Gemini Agent**: Running on port 9004 with `@google/gemini-cli`
- **Backend**: API keys properly configured, WebSocket endpoints functional
- **Services**: All containers build and run successfully

### CLI Tools Installation
- Both tools installed globally in backend container
- Available via `claude` and `gemini` commands
- API keys exported to shell sessions
- Help documentation accessible

### HTTP API Endpoints
- `/ws/{agent_name}` - Agent communication
- `/ws-shell/{session_key}` - Terminal sessions
- Both Claude and Gemini respond via HTTP API calls

## ⚠️ Known Issues

### TerminalPane Limitations
**Problem**: Embedded terminal panes show empty responses for CLI commands
- Commands execute successfully in Docker
- Console shows `Received: ""` (empty strings)
- No output displayed in terminal panes
- Affects both `claude --print` and `gemini --prompt` commands

**Root Cause**: Pipe-based shell sessions don't handle interactive CLI tools properly on Windows

### Windows Compatibility
- `--dangerously-skip-permissions` flag causes hangs (resolved)
- PTY implementation has buffering issues
- Shell sessions timeout frequently

## 🔧 Solutions Implemented

### 1. API Key Management
```bash
# Environment variables properly set
export ANTHROPIC_API_KEY="your-claude-key"
export GEMINI_API_KEY="your-gemini-key"
```

### 2. Docker Configuration
```yaml
# docker-compose.yml
agent-claude:
  build: ./agent-claude
  environment:
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
  ports:
    - "9003:9000"

agent-gemini:
  build: ./agent-gemini
  environment:
    - GEMINI_API_KEY=${GEMINI_API_KEY}
  ports:
    - "9004:9000"
```

### 3. WebSocket Improvements
- Automatic reconnection logic
- Connection state validation
- Better error handling
- Increased timeouts (60s)

## 🚀 Recommended Solutions

### Option 1: WebTTY Integration
Replace current shell with a true PTY proxy:
```bash
# Add ttyd service
ttyd:
  image: tsl0922/ttyd
  ports:
    - "7681:7681"
  command: ttyd -p 7681 bash
```

### Option 2: CLI-as-RPC Pattern
Treat AI tools as RPC services:
```javascript
// Frontend sends JSON requests
{
  "tool": "claude",
  "prompt": "write a Python function",
  "flags": ["--print"]
}
```

### Option 3: Native Windows PTY
Use node-pty for Windows hosts:
```javascript
const pty = require('node-pty');
const shell = pty.spawn('bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30
});
```

## 📋 Usage Instructions

### Working Commands
```bash
# Direct Docker execution (works)
docker exec prompt-ui-toolbox-main-backend-1 claude --print "hello world"
docker exec prompt-ui-toolbox-main-backend-1 gemini --prompt "hello world"

# HTTP API calls (works)
curl -X POST http://localhost:9003/execute \
  -H "Content-Type: application/json" \
  -d '{"input": "hello world"}'
```

### Terminal Pane Commands (limited)
```bash
# These show empty responses in embedded terminals
claude --print "hello world"
gemini --prompt "hello world"

# Use Multi-Agent Chat instead for reliable responses
```

## 🛠 Troubleshooting

### If Commands Don't Work
1. Check API keys are set: `echo $ANTHROPIC_API_KEY`
2. Restart services: `docker compose restart backend`
3. Refresh browser for new terminal sessions
4. Use Multi-Agent Chat for reliable AI responses

### Debug Commands
```bash
# Check container status
docker compose ps

# View logs
docker compose logs backend --tail 20

# Test CLI tools directly
docker exec prompt-ui-toolbox-main-backend-1 claude --help
docker exec prompt-ui-toolbox-main-backend-1 gemini --help
```

## 📊 Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Docker Containers | ✅ Working | All services running |
| CLI Tools | ✅ Installed | Available in containers |
| HTTP API | ✅ Working | Agent communication functional |
| TerminalPane | ⚠️ Limited | Empty responses on Windows |
| Multi-Agent Chat | ✅ Working | Recommended for AI interactions |

## 🔄 Next Steps

1. **Choose TerminalPane Solution**: Implement WebTTY, RPC pattern, or native PTY
2. **Update PRD**: Document chosen approach and requirements
3. **Cross-Platform Testing**: Verify solution works on Windows, macOS, Linux
4. **User Documentation**: Update usage guides with workarounds

## 📝 Files Modified

- `docker-compose.yml` - Added agent services
- `backend/Dockerfile` - Installed CLI tools globally
- `backend/shell_manager.py` - PTY implementation and timeouts
- `agent-claude/agent_service.js` - Claude service
- `agent-gemini/agent_service.js` - Gemini service
- `src/components/TerminalPane.tsx` - WebSocket improvements

---

**Integration Date**: December 2024  
**Status**: Functional with known limitations  
**Recommendation**: Use Multi-Agent Chat for AI interactions, implement WebTTY for full terminal functionality 