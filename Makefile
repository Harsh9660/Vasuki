.PHONY: start-backend start-frontend start-all

start-backend:
	python -m venv .venv || true
	. .venv/bin/activate && pip install -r backend/requirements.txt
	. .venv/bin/activate && uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

start-frontend:
	cd frontend && npm install && npm run dev

start-all: start-backend start-frontend
