#!/bin/bash
# Remove leftovers from previous runs
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99

export DISPLAY=:99
Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset &
sleep 2

# Start window manager
openbox-session &

# Start VNC server
x11vnc -display :99 -forever -nopw -bg -rfbport 5900

# Start noVNC (find correct path)
if [ -f "/usr/share/novnc/utils/novnc_proxy" ]; then
    /usr/share/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &
elif command -v novnc_proxy >/dev/null 2>&1; then
    novnc_proxy --vnc localhost:5900 --listen 6080 &
else
    echo "Warning: noVNC proxy not found."
fi

python3 -m uvicorn app.main:app --host 0.0.0.0 --port 5000
