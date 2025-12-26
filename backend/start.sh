#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting FastAPI server..."
# Use PORT environment variable from Render (defaults to 8000 for local dev)
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
