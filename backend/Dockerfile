FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies required for psycopg2 and httpx
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose API port only
EXPOSE 5000

CMD ["python", "run.py"]
