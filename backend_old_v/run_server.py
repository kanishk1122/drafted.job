"""
Custom server runner that ensures ProactorEventLoop on Windows.
This script properly configures the event loop before starting uvicorn.
"""
import asyncio
import sys

if sys.platform == 'win32':
    # CRITICAL: Set this before any other imports
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    print("🔧 ProactorEventLoopPolicy configured for Windows")

import uvicorn

def get_proactor_event_loop():
    """Factory function to create ProactorEventLoop on Windows."""
    if sys.platform == 'win32':
        loop = asyncio.ProactorEventLoop()
        print(f"✅ Created ProactorEventLoop: {type(loop)}")
        return loop
    return asyncio.new_event_loop()

if __name__ == "__main__":
    config = uvicorn.Config(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=False,  # MUST be False to use custom loop factory
        log_level="info",
        loop="asyncio"  # Use asyncio loop (will respect our policy)
    )
    
    server = uvicorn.Server(config)
    
    # Create and set our ProactorEventLoop
    if sys.platform == 'win32':
        loop = get_proactor_event_loop()
        asyncio.set_event_loop(loop)
    
    # Run the server
    if sys.platform == 'win32':
        loop.run_until_complete(server.serve())
    else:
        asyncio.run(server.serve())
