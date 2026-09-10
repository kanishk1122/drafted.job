import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn

if __name__ == "__main__":
    # NOTE: For hot-reload use CLI: uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload
    # Manual Proactor loop is required for Playwright subprocess_exec on Windows
    config = uvicorn.Config(
        "app.main:app",
        host="127.0.0.1",
        port=5000,
        reload=False,  # reload=True conflicts with manual loop; use CLI --reload for dev
    )
    server = uvicorn.Server(config)

    loop = asyncio.ProactorEventLoop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(server.serve())
    finally:
        loop.close()
