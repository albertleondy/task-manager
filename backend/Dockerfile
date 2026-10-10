ARG BASE_IMAGE=python:3.11-slim
FROM ${BASE_IMAGE}

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (curl for health check)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose backend service port
EXPOSE 8000

# Container healthcheck using backend /health endpoint (every 30s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Wait for DB readiness, apply Alembic migrations, and start FastAPI application
CMD ["sh", "-c", "python scripts/wait_for_db.py && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
