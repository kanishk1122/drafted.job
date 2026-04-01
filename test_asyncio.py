import asyncio
import sys

async def test():
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    print(f"Loop policy: {type(asyncio.get_event_loop_policy())}")
    print(f"Loop: {type(asyncio.get_event_loop())}")
    
    try:
        proc = await asyncio.create_subprocess_exec(
            'cmd.exe', '/c', 'echo hello',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        print(f"Success: {stdout.decode().strip()}")
    except Exception as e:
        print(f"Failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test())
