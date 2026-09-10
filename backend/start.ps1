# Windows dev server (PowerShell). Do not use start_vnc.sh on Windows.
Set-Location $PSScriptRoot
& ".\.venv\Scripts\python.exe" run.py
