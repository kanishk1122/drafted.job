import os
import asyncio
from playwright.async_api import async_playwright
from pathlib import Path

# Base directory for all user profiles
USER_PROFILES_DIR = Path("/app/user_profiles")

class BrowserService:
    def __init__(self):
        # Ensure profiles root exists
        USER_PROFILES_DIR.mkdir(parents=True, exist_ok=True)

    def get_user_profile_path(self, user_id: str) -> str:
        profile_path = USER_PROFILES_DIR / user_id
        profile_path.mkdir(parents=True, exist_ok=True)
        return str(profile_path)

    async def launch_user_browser(self, user_id: str, headless: bool = True):
        """
        Launches a persistent browser context for a specific user.
        Keeps logs, cookies, and localStorage saved for future sessions.
        """
        pw = await async_playwright().start()
        profile_path = self.get_user_profile_path(user_id)
        
        # WE NOW USE CHANNEL="CHROME" TO ENSURE WE ARE NOT USING BUNDLED CHROMIUM
        context = await pw.chromium.launch_persistent_context(
            user_data_dir=profile_path,
            channel="chrome", 
            headless=headless,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--remote-allow-origins=*"
            ]
        )
        return context, pw

    async def run_automation_for_user(self, user_id: str, task_url: str, headless: bool = True):
        """
        Example task run on a user's persistent profile.
        """
        context, pw = await self.launch_user_browser(user_id, headless=headless)
        page = await context.new_page()
        try:
            print(f"🚀 Working on user {user_id} profile at {task_url}")
            await page.goto(task_url)
            # In setup mode, we wait for a specific time or interaction
            if not headless:
                await asyncio.sleep(300) # 5 minutes for manual setup
        finally:
            await context.close()
            await pw.stop()

    async def connect_to_local_chrome(self, host: str = "host.docker.internal", port: int = 9223, retries: int = 3):
        """
        Connects to local Chrome via CDP with retry logic.
        Chrome must be running with --remote-debugging-port=9223 --remote-debugging-address=0.0.0.0
        """
        import httpx
        browser_url = f"http://{host}:{port}"
        last_error = None

        for attempt in range(1, retries + 1):
            pw = await async_playwright().start()
            try:
                print(f"📡 [{attempt}/{retries}] Probing DevTools at {browser_url}/json/version...")
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        f"{browser_url}/json/version",
                        headers={"Host": f"localhost:{port}"},  # Bypass Chrome security check
                        timeout=5.0
                    )
                    if resp.status_code != 200:
                        raise Exception(f"DevTools returned HTTP {resp.status_code}")

                    info = resp.json()
                    ws_url = info.get("webSocketDebuggerUrl")
                    if not ws_url:
                        raise Exception("No webSocketDebuggerUrl in response — Chrome may be in use by another debugger")

                    # Rewrite localhost → docker host bridge
                    ws_url = ws_url.replace("localhost", host).replace("127.0.0.1", host)

                print(f"🔗 Connecting via WebSocket: {ws_url}...")
                browser = await pw.chromium.connect_over_cdp(ws_url)

                context = browser.contexts[0] if browser.contexts else await browser.new_context()
                return context, pw, browser

            except Exception as e:
                last_error = e
                print(f"⚠️ Attempt {attempt} failed: {e}")
                await pw.stop()
                if attempt < retries:
                    print(f"   Retrying in 2s...")
                    await asyncio.sleep(2)

        print(f"❌ CDP Connection failed after {retries} attempts: {last_error}")
        raise Exception(
            f"Could not connect to Chrome on port {port}. "
            f"Make sure the local Chrome browser is open (launched from the Connect page). "
            f"Error: {last_error}"
        )

    async def check_platform_session(self, platform_key: str) -> bool:
        """
        Connects to the local Chrome via CDP and checks if the session is active
        for the given platform.
        """
        context = pw = browser = None
        try:
            context, pw, browser = await self.connect_to_local_chrome()
            
            is_active = False
            cookies = await context.cookies()
            
            if platform_key == "linkedin":
                is_active = any(c['name'] == 'li_at' for c in cookies)
            elif platform_key == "naukri":
                # Expanded Naukri Session Vector: checking multiple core recruitment identifiers
                session_keys = {'S', 'n_vid', 'cticket', 'nauk_at', 'nauk_sid', 'nauk_otl'}
                is_active = any(c['name'] in session_keys for c in cookies)
            elif platform_key == "foundit":
                # Foundit Session Vector using user-specified signals
                is_active = any(c['name'] in ['_uetsid', '_uetvid'] for c in cookies)
            elif platform_key == "indeed":
                # Indeed High-Volume Signal
                is_active = any(c['name'] in ['CTK', 'INDEED_CSRF_TOKEN'] for c in cookies)
            else:
                is_active = len(cookies) > 0 # General heuristic for other nodes

            return is_active
        except Exception as e:
            print(f"⚠️ Session check failed: {str(e)}")
            return False
        finally:
            if browser: await browser.close()
            if pw: await pw.stop()

    async def run_automation_locally(self, task_url: str):
        """
        Runs an automation task on the user's LOCAL browser via CDP.
        """
        context, pw, browser = await self.connect_to_local_chrome()
        page = await context.new_page()
        try:
            await page.goto(task_url)
            print(f"✅ Controlling local browser: {await page.title()}")
        finally:
            await browser.close()
            await pw.stop()

    async def navigate_locally(self, task_url: str):
        """
        Navigates the already open local Chrome to a specific platform URL.
        Does NOT close the browser, allows user to continue using it.
        """
        context = pw = browser = None
        try:
            context, pw, browser = await self.connect_to_local_chrome()
            # Reuse first page or create new one if empty
            pages = context.pages
            page = pages[0] if pages else await context.new_page()
            
            await page.goto(task_url)
            await page.bring_to_front()
            print(f"🎯 AI-Controlled Navigation: {task_url}")
        finally:
            if pw: await pw.stop()
            # WE DO NOT CLOSE browser OR context HERE so the user can interact.

browser_service = BrowserService()
