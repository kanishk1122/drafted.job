import asyncio
from browser_use import Browser, BrowserProfile, Agent, ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    # Force Proactor loop on Windows
    import sys
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        
    browser = Browser(headless=False)
    llm = ChatOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=os.getenv("NVIDIA_API_KEY"),
        model="meta/llama-3.3-70b-instruct",
    )
    
    agent = Agent(
        task="Navigate to google.com and search for 'browser-use'",
        browser=browser,
        llm=llm
    )
    
    try:
        await agent.run()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await browser.stop()

if __name__ == "__main__":
    asyncio.run(main())
