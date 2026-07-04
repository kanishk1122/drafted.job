# Windows dev server (PowerShell). Do not use start_vnc.sh on Windows.
Set-Location $PSScriptRoot
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload
