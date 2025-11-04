FROM python:3.11-slim

# Use /app as container workspace
WORKDIR /app

# Copy the entire backend build context (the ./backend folder) into /app/backend
# so paths inside the Dockerfile match the docker-compose build context.
COPY . /app/backend

# Install dependencies from the copied requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# Run the app using the package path expected by the code (backend.app.main)
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]