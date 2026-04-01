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
        
        # Chrome is preferred for better site compatibility
        context = await pw.chromium.launch_persistent_context(
            user_data_dir=profile_path,
            headless=headless,
            # Common arguments for Playwright inside Docker
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ]
        )
        return context, pw

    async def run_automation_for_user(self, user_id: str, task_url: str):
        """
        Example task run on a user's persistent profile.
        """
        context, pw = await self.launch_user_browser(user_id)
        page = await context.new_page()
        try:
            print(f"🚀 Working on user {user_id} profile at {task_url}")
            await page.goto(task_url)
            # Perform specific automation steps here
            # ...
        finally:
            await context.close()
            await pw.stop()

browser_service = BrowserService()
