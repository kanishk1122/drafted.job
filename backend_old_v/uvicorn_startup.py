"""
Uvicorn startup hook to ensure ProactorEventLoop is used on Windows.
This MUST be imported before uvicorn creates its event loop.
"""
import asyncio
import sys

if sys.platform == 'win32':
    # Force ProactorEventLoop on Windows BEFORE uvicorn creates a loop
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    print("✅ ProactorEventLoopPolicy set for Windows in worker process")
