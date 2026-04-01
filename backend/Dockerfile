FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies for Playwright and GUI
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    xvfb \
    openbox \
    x11vnc \
    dbus-x11 \
    novnc \
    websockify \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .
RUN chmod +x start_vnc.sh

# Expose ports for API and VNC
EXPOSE 5000 5900

CMD ["./start_vnc.sh"]
