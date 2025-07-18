# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8e8c7e8b-0643-401b-96b1-5eaf3d8934cc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8e8c7e8b-0643-401b-96b1-5eaf3d8934cc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8e8c7e8b-0643-401b-96b1-5eaf3d8934cc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Running Backend + Agents with Docker Compose

This repo includes a `docker-compose.yml` that spins up the FastAPI backend plus three agent services (PM, Frontend, Backend). Each agent is an independent container that the backend contacts over HTTP.

### Prerequisites
* Docker Desktop (or Docker Engine + Docker Compose V2)

### One-liner
```bash
# from project root
docker compose up --build
```

Compose will:
1. Build the backend image in `prompt-ui-toolbox-main/backend` (installs dependencies, copies source).
2. Build a lightweight agent image from `agent/` three times (pm, frontend, backend).
3. Start four containers:
   * `backend`      – FastAPI app on http://localhost:8000
   * `agent-pm`     – Echo agent on port 9000 (mapped)
   * `agent-frontend` – Echo agent on port 9001
   * `agent-backend`  – Echo agent on port 9002

Logs stream in the same terminal. Press `Ctrl-C` to stop and `docker compose down` to remove containers.

### Testing

1. Health-check backend:
   ```bash
   curl http://localhost:8000/
   #=> {"status":"Backend is running"}
   ```

2. Talk to an agent via backend WebSocket (example with `wscat`):
   ```bash
   npx wscat -c ws://localhost:8000/ws/pm
   > hello
   < PM ECHO: hello
   ```

3. Talk to an agent directly:
   ```bash
   curl -X POST http://localhost:9001/execute -H "Content-Type: application/json" -d '{"input":"ping"}'
   #=> {"output":"FRONTEND ECHO: ping"}
   ```

### Customising Agents
Replace `agent/agent_service.py` and its Dockerfile with real AI model wrappers (e.g., Gemini CLI, Claude CLI). Update ports or environment variables in `docker-compose.yml` if needed.
