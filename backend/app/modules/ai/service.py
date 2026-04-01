from openai import AsyncOpenAI
from app.core.config import settings
import json
import re

class AIService:
    def __init__(self):
        # NVIDIA NIM API configuration using UPPERCASE settings
        self.api_key = settings.NVIDIA_API_KEY
        self.model = settings.MODEL_NAME
        self.client = AsyncOpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=self.api_key
        ) if self.api_key else None

    async def extract_intent(self, user_message: str):
        if not self.client:
            print("Warning: NVIDIA_API_KEY not set. Using mock extraction.")
            return self._mock_extraction(user_message)

        prompt = f"""
        Extract professional intent from bio: "{user_message}"
        Identify: role, experience_years, skills (list), primary_goal, summary.
        Return ONLY valid JSON.
        """

        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=1024,
                timeout=15.0
            )
            
            response_text = completion.choices[0].message.content
            # Tactical JSON cleanup
            clean_json = re.sub(r"```json|```", "", response_text).strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"Error calling NVIDIA NIM: {e}")
            return self._mock_extraction(user_message)

    async def parse_resume(self, resume_text: str):
        if not self.client:
            return self._mock_resume_parsing(resume_text)

        prompt = f"""
        Extract professional info from resume: "{resume_text[:4000]}"
        Structure as JSON: full_name, email, phone, location, summary, skills (list), experience (list), education (list).
        
        Surgical Extraction Rules:
        1. EDUCATION: For each item, capture: "degree", "institution" (be specific), "duration" (years). If missing, use empty string.
        2. EXPERIENCE: For each item, capture: "role", "company", "duration", "description".
        3. SKILLS EXPANSION: Extract explicit skills AND infer relational skills. 
           (e.g., If 'BeautifulSoup' or 'Scrapy' is found, add 'Python'. If 'React' is found, add 'JavaScript/TypeScript' and 'Frontend'). 
           Ensure all important modern technical stack anchors are present and but also include the skill which is mentioned originally.
        
        Return ONLY valid JSON.
        """

        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2048,
                timeout=30.0
            )
            
            response_text = completion.choices[0].message.content
            # Surgical extraction of the first JSON object
            json_match = re.search(r'(\{.*\})', response_text, re.DOTALL)
            if json_match:
                clean_json = json_match.group(1).strip()
                print(f"Isolated Identity Pulse: {clean_json}")
                return json.loads(clean_json)
            
            # Fallback for code blocks
            clean_json = re.sub(r"```json|```", "", response_text).strip()
            print(clean_json)
            return json.loads(clean_json)
        except Exception as e:
            print(f"Error parsing resume via NVIDIA NIM: {e}. Raw response start: {response_text[:100] if 'response_text' in locals() else 'N/A'}")
            return self._mock_resume_parsing(resume_text)

    def _mock_resume_parsing(self, text: str):
        return {
            "full_name": "Applicant Name",
            "email": "applicant@example.com",
            "phone": "000-000-0000",
            "location": "Global",
            "summary": "AI extracted summary placeholder",
            "skills": ["Python", "General Software Engineering"],
            "experience": [],
            "education": []
        }

    def _mock_extraction(self, message: str):
        message_lower = message.lower()
        role = "Python Developer" if "python" in message_lower else "Software Developer"
        return {
            "role": role,
            "experience_years": 4,
            "skills": ["Python", "RESTful API"] if "python" in message_lower else [],
            "primary_goal": "Job Search",
            "summary": "Extracted intent (Mocked due to missing AI credentials)"
        }

ai_service = AIService()
