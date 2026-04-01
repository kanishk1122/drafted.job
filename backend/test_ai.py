import os
import json
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment from .env
load_dotenv()

async def test_nvidia_nim():
    api_key = os.getenv("NVIDIA_API_KEY")
    model_name = os.getenv("MODEL_NAME", "meta/llama-3.1-8b-instruct")
    base_url = "https://integrate.api.nvidia.com/v1"

    print(f"📡 Testing NVIDIA NIM Connection...")
    print(f"👉 Model: {model_name}")
    print(f"👉 API Key (last 4): {api_key[-4:] if api_key else 'MISSING'}")

    if not api_key:
        print("❌ ERROR: NVIDIA_API_KEY not found in .env")
        return

    client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    test_prompt = """Analyze job fit for Role: Python Developer
Skills: React, Python, PostgreSQL
Job: Senior Backend Engineer
Score 0-100, JSON only. Format: {"score": 85, "reason": "Good match for backend skills."}"""

    try:
        print("\n🧠 Sending test request to AI...")
        completion = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": test_prompt}],
            temperature=0.1,
            max_tokens=256,
            timeout=15.0
        )
        
        response_text = completion.choices[0].message.content
        print(f"\n✅ SUCCESS! Raw Response:\n{response_text}")
        
        try:
            data = json.loads(response_text)
            print(f"\n📊 Parsed AI Decision:")
            print(f"   Score: {data.get('score')}")
            print(f"   Reason: {data.get('reason')}")
        except:
            print("\n⚠️  AI responded but didn't return perfect JSON (Normal for some models).")

    except Exception as e:
        print(f"\n❌ AI FAILED: {str(e)}")
        print("\n💡 Troubleshooting:")
        print("1. Key might be invalid or quota and trial credits are exhausted.")
        print("2. Model name might be incorrect or unavailable for your key.")
        print("3. Check if 'host.docker.internal' is reachable if running from Docker.")

if __name__ == "__main__":
    asyncio.run(test_nvidia_nim())
