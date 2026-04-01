import asyncio
import csv
import os
from datetime import datetime
from dotenv import load_dotenv
from browser_use import Agent, Browser, Controller
from browser_use.llm.openai.chat import ChatOpenAI

load_dotenv()

# --- 1. SETUP CONTROLLER ---
controller = Controller()

@controller.action('Save Job')
def save_job(job_title: str, company: str, location: str, salary: str = "Not specified", source_url: str = "Unknown"):
    """
    Saves a job posting to a CSV file. 
    Call this IMMEDIATELY when you find a job that matches the requirements.
    """
    filename = "smart_agent_jobs.csv"
    try:
        file_exists = os.path.isfile(filename) and os.stat(filename).st_size > 0
        with open(filename, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            if not file_exists:
                writer.writerow(["Timestamp", "Job Title", "Company", "Location", "Salary", "Source"])
            
            writer.writerow([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                job_title,
                company,
                location,
                salary,
                source_url
            ])
        print(f"💰 KA-CHING! Saved: {job_title} at {company}")
        return f"✅ SUCCESS: Job saved. Check if you have saved 2 jobs yet."
    except Exception as e:
        return f"❌ Error saving job: {str(e)}"

# --- 2. MAIN LOGIC ---
async def main():
    if not os.getenv("NVIDIA_API_KEY"):
        raise ValueError("NVIDIA_API_KEY is not set in the environment variables.")

    # Modified LLM settings for better stability with Kimi/Nvidia
    llm = ChatOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=os.getenv("NVIDIA_API_KEY"),
        model="meta/llama-3.3-70b-instruct",
        temperature=0.1,
        max_completion_tokens=4096  # Increased to prevent JSON cutoff
    )

    browser = Browser()
    
    # --- 3. THE REFINED PROMPT ---
    # Simplified instructions to help the model focus on tool calling
    task = """
    **GOAL**: Find and save exactly 2 high-quality job postings for Junior Full Stack Developers (MERN/Python) in Remote or Jaipur locations.

    **CRITICAL RULES**:
    1. You MUST use the `Save Job` tool to save a job.
    2. Do not stop until you have saved 2 jobs.
    3. If a job details page opens in a sidebar/popup, read it there.

    **STEP 1: START**
    - Navigate to: https://www.google.com/search?q=site:workatastartup.com+%22Full+Stack%22+(Junior+OR+Entry)+(MERN+OR+Python)
    
    **STEP 2: SEARCH & SAVE LOOP**
    1. Scroll down immediately to load results.
    2. Click on a relevant job link (Junior/Entry level).
    3. Read the details.
    4. IF MATCH: Call `Save Job(job_title=..., company=..., location=..., salary=..., source_url=...)`.
    5. IF NO MATCH: Go back and try the next link.
    6. Close any tabs you open after checking them.

    **STEP 3: FINISH**
    - Once you have successfully called `Save Job` 2 times, you are done.
    """
    
    agent = Agent(
        task=task,
        browser=browser,
        llm=llm,
        controller=controller,
        use_vision=False, 
        flash_mode=False, # <--- CHANGED TO FALSE (Critical for this model)
    )
    
    await agent.run()

if __name__ == "__main__":
    asyncio.run(main())