# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY ./app ./app

# Copy alembic files for migrations
COPY ./alembic ./alembic
COPY ./alembic.ini .

# Copy start script
COPY ./start.sh .
RUN chmod +x start.sh

# Expose FastAPI default port
EXPOSE 8000

# Run migrations and start server
CMD ["./start.sh"]
