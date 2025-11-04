# Vasuki — AI Agent (prototype)

This repository contains a minimal prototype of "Vasuki" — an AI agent with a backend API (FastAPI) and a frontend chat UI (React + Vite).

Goals:
- Provide a simple, extendable backend that proxies to OpenAI (if available) or falls back to an offline canned response.
- Provide a minimal React chat UI that talks to the backend.

Quick start (development)

1. Backend

```bash
# create a venv, install deps, run backend
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

3. Environment

- To use the OpenAI API you must set `OPENAI_API_KEY` in the environment (or in `backend/.env`):

```
OPENAI_API_KEY=sk-...your-key...
```

If no API key is present the backend will respond with a simple offline stub so you can develop UI and plumbing.

Files added
- `backend/` — FastAPI app and agent wrapper
- `frontend/` — React + Vite chat UI

Next steps
- Add docker-compose for local full-stack run
- Add tests and CI
- Harden the agent (rate limits, caching, streaming responses)

