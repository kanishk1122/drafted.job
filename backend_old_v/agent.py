import asyncio
import os
import csv
import sys
from datetime import datetime
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        if not isinstance(asyncio.get_event_loop_policy(), asyncio.WindowsProactorEventLoopPolicy):
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

from browser_use import Agent, Browser, Controller, ChatOpenAI
# Use LangChain version only if needed specifically, but for Agent use the browser_use one
from langchain_openai import ChatOpenAI as LangChainChatOpenAI
from database import SessionLocal, Job, JobStatus, Profile, PlatformConnection

load_dotenv()

controller = Controller()



@controller.action('Save Job for Review')
def save_job(
    job_title: str, 
    company: str, 
    location: str, 
    match_score: int,
    reasoning_want: str,
    reasoning_fit: str,
    platform: str,
    salary: str = "Not specified", 
    source_url: str = "Unknown"
):
    """
    Saves a job posting to the queue for submission. 
    reasoning_want: What the user specifies they want for this job type.
    reasoning_fit: Why this specific job is a good fit.
    platform: The source (e.g., LinkedIn, Naukri).
    """
    db = SessionLocal()
    try:
        new_job = Job(
            title=job_title,
            company=company,
            location=location,
            match_score=match_score,
            reasoning_want=reasoning_want,
            reasoning_fit=reasoning_fit,
            platform=platform,
            salary=salary,
            source_url=source_url,
            status=JobStatus.QUEUED
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        print(f"📥 Queued for review: {job_title} at {company} (Score: {match_score}%)")
        return f"✅ SUCCESS: Job added to submission queue (ID: {new_job.id})."
    except Exception as e:
        db.rollback()
        return f"❌ Error: {str(e)}"
    finally:
        db.close()

@controller.action('Apply Automatically')
async def apply_automatically(reason: str):
    """
    Call this when you have successfully navigated to an 'Easy Apply' or simple application form 
    and have filled it out using the user's profile info.
    """
    # In a real scenario, the agent would interact with the page. 
    # This tool marks the SUCCESS of that interaction.
    # The agent is expected to have typed the info into the fields first.
    return f"🚀 NOTED: Recording application attempt. Reason: {reason}"

async def run_job_search(query: str, headless: bool = True, platforms: list = []):
    if not os.getenv("NVIDIA_API_KEY"):
        raise ValueError("NVIDIA_API_KEY is not set in the environment variables.")

    db = SessionLocal()
    profile = db.query(Profile).first()
    db.close()

    platform_targets = ", ".join(platforms) if platforms else "relevant Indian job portals (LinkedIn, Naukri, Indeed, Instahyre)"

    profile_info = f"""
    USER PROFILE:
    Name: {profile.full_name}
    Email: {profile.email}
    Phone: {profile.phone}
    Bio/Resume: {profile.resume_text}
    
    CREDENTIALS (Use these for logins if required):
    Naukri: {profile.naukri_email} / {profile.naukri_pass}
    LinkedIn: {profile.linkedin_email} / {profile.linkedin_pass}
    Indeed: {profile.indeed_email} / {profile.indeed_pass}
    Instahyre: {profile.instahyre_email} / {profile.instahyre_pass}
    """

    llm = ChatOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=os.getenv("NVIDIA_API_KEY"),
        model="meta/llama-3.2-90b-vision-instruct",  # NVIDIA hosted vision model
        temperature=0.1,
    )

    # Try to find a persistent session for one of the target platforms
    user_data_dir = None
    if platforms:
        primary_platform = platforms[0]
        user_data_dir = os.path.join(os.getcwd(), 'browser_sessions', primary_platform)
        if not os.path.exists(user_data_dir):
            user_data_dir = None
    
    browser = Browser(
        headless=headless,
    )
    
    task = f"""
    **GOAL**: Find and process job postings for: "{query}"

    **WORKFLOW**:
    1. Search for jobs matching the query EXCLUSIVELY on: {platform_targets}.
    2. For EACH promising job:
       a. Analyze the job against USER DETAILS and the query.
       b. Determine a **match_score** (0-100%).
       c. Formulate **reasoning_want** (summary of user's core requirements) and **reasoning_fit** (why this job matches).
       d. Identify the **platform** name correctly.
       e. If it has a "Quick Apply" or simple form, attempt to FILL it. If successful, call `Apply Automatically`.
       f. If it's a complex application, ALWAYS call `Save Job for Review` with all extracted metadata (score, reasoning, platform, etc.).

    **USER DETAILS FOR APPLICATIONS**:
    {profile_info}

    **STRATEGY**:
    - Be exhaustive. If you move to an external site, try to find the direct application or save it for the user to review.
    - Focus on high-quality matches.
    """
    
    agent = Agent(
        task=task,
        browser=browser,
        llm=llm,
        controller=controller,
        use_vision=False, 
        flash_mode=False,
    )
    
    await agent.run()
    # Close browser after run to save resources
    await browser.stop()

async def run_interactive_login(platform_id: str):
    """
    Opens a browser for the user to manually log in to a platform.
    Once logged in, updates the database state.
    """
    from database import PlatformConnection
    
    db = SessionLocal()
    
    platform_urls = {
        'linkedin': 'https://www.linkedin.com/login',
        'naukri': 'https://www.naukri.com/nlogin/login',
        'indeed': 'https://secure.indeed.com/auth',
        'instahyre': 'https://www.instahyre.com/login'
    }
    
    url = platform_urls.get(platform_id, 'https://www.google.com')
    
    # We use a persistent context so the login stays active
    # In a real app, you'd want a separate dir per platform or user
    user_data_dir = os.path.join(os.getcwd(), 'browser_sessions', platform_id)
    os.makedirs(user_data_dir, exist_ok=True)
    
    
    browser = Browser(  
        headless=False
        )
    llm = ChatOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=os.getenv("NVIDIA_API_KEY"),
        model="meta/llama-3.2-90b-vision-instruct",  # NVIDIA hosted vision model
    )
    
    task = f"""
    1. Navigate to {url}
    2. Wait for the user to MANUALLY LOG IN.
    3. Monitor the page. Once you see that the user is successfully logged in (e.g., they are on a dashboard, or you see 'Logout' or 'Profile' icons), 
       simply stop and report SUCCESS.
    4. If the user closes the browser or takes too long, report FAILURE.
    """
    
    agent = Agent(
        task=task,
        browser=browser,
        llm=llm,
        use_vision=True,
        flash_mode=False,
    )
    
    history = await agent.run()
    
    # Check if last step was success
    if history.is_done():
        # Update DB
        conn = db.query(PlatformConnection).filter(PlatformConnection.platform_id == platform_id).first()
        if not conn:
            conn = PlatformConnection(platform_id=platform_id)
            db.add(conn)
        
        conn.is_connected = 1
        conn.last_login = datetime.utcnow()
        conn.session_path = user_data_dir
        db.commit()
        print(f"✅ Platform {platform_id} connected successfully.")
    
    await browser.stop()
    db.close()
