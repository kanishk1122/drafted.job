import os
import asyncio
from datetime import datetime
from database import SessionLocal, PlatformConnection


async def run_interactive_login_simple(platform_id: str):
    """
    Simple browser-based login - just opens browser and waits for user to log in.
    Detects login by monitoring URL changes.
    """
    from browser_use import Browser
    
    platform_urls = {
        'linkedin': 'https://www.linkedin.com/login',
        'naukri': 'https://www.naukri.com/nlogin/login',
        'indeed': 'https://secure.indeed.com/auth',
        'instahyre': 'https://www.instahyre.com/login'
    }
    
    login_url = platform_urls.get(platform_id, 'https://www.google.com')
    
    # Directory to save browser session
    user_data_dir = os.path.join(os.getcwd(), 'browser_sessions', platform_id)
    os.makedirs(user_data_dir, exist_ok=True)
    
    print(f"🌐 Opening browser for {platform_id} login...")
    
    # Use browser-use Browser class
    browser = Browser(headless=False , disable_security=True)
    
    try:
        await browser.start()
        
        # Get the context and page
        context = await browser.get_context()
        page = await browser.get_current_page()
        
        # Navigate to login page
        await page.goto(login_url)
        print(f"📍 Navigated to {login_url}")
        print("⏳ Waiting for you to log in manually...")
        print("💡 The browser will stay open. Please log in, then the session will be saved automatically.")
        
        # Wait for URL to change (indicates user logged in)
        login_detected = False
        max_wait_seconds = 300  # 5 minutes
        check_interval = 2  # Check every 2 seconds
        
        for i in range(0, max_wait_seconds, check_interval):
            await asyncio.sleep(check_interval)
            current_url = page.url
            
            # Check if URL has changed from login page
            if login_url not in current_url:
                # Common indicators of successful login
                if any(indicator in current_url.lower() for indicator in ['feed', 'home', 'dashboard', 'profile', 'mypage', 'myjobs']):
                    login_detected = True
                    print(f"✅ Login detected! Current URL: {current_url}")
                    break
        
        if login_detected:
            # Save the browser session (cookies, localStorage, etc.)
            storage_state_path = os.path.join(user_data_dir, 'storage_state.json')
            await context.storage_state(path=storage_state_path)
            print(f"💾 Session saved to: {storage_state_path}")
            
            # Update database
            db = SessionLocal()
            try:
                conn = db.query(PlatformConnection).filter(
                    PlatformConnection.platform_id == platform_id
                ).first()
                
                if not conn:
                    conn = PlatformConnection(platform_id=platform_id)
                    db.add(conn)
                
                conn.is_connected = 1
                conn.last_login = datetime.utcnow()
                conn.session_path = storage_state_path
                db.commit()
                print(f"✅ Platform {platform_id} connected successfully!")
            finally:
                db.close()
        else:
            print("⏰ Timeout - no login detected. Please try again.")
    
    finally:
        await browser.stop()
