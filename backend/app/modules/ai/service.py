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

    async def refine_search_query(self, user_query: str, skills: str, experience_text: str):
        if not self.client:
            return user_query

        prompt = f"""
        Optimize this job search query for platforms like LinkedIn/Indeed.
        User Intent: "{user_query}"
        Candidate Skills: {skills[:500]}
        Candidate Experience Summary: {experience_text[:500]}
        
        Rules:
        - KEEP the core role EXACTLY as provided in User Intent. (DO NOT ADD Senior, Junior, or other seniority/experience levels if they are not in the User Intent).
        - Enhancethis by adding ONLY 2-3 most relevant technical keywords from the Candidate Skills.
        - Return a concise 3-5 word search string.
        - Return ONLY the optimized string. No quotes, no intro.
        """

        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=64,
                timeout=10.0
            )
            return completion.choices[0].message.content.strip().replace('"', '')
        except Exception as e:
            print(f"Error refining search query: {e}")
            return user_query

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

    async def generate_tactical_recommendations(self, user_info: dict, resume_text: str):
        if not self.client:
            return self._mock_recommendations()

        prompt = f"""
        Analyze candidate profile and resume to generate 3 UNIQUE, TACTICAL career recommendations.
        
        User Context: {json.dumps(user_info)}
        Resume Excerpt: {resume_text[:2000]}
        
        Rules:
        1. BE SPECIFIC: Don't say "Learn Python". Say "Learn FastAPI and SQLAlchemy to transition into Backend Search Architecture".
        2. BE STRATEGIC: Identify role adjacencies (e.g., if they are a React dev, suggest 'Software Engineer in Test' or 'Technical Lead - Design Systems').
        3. BE ACTIONABLE: Each rec must have a Title, Description (2 sentences), and Category (Role, Skill, or Network).
        
        Format: Return ONLY a JSON list of 3 items.
        Example: 
        [
          {{"title": "Bridge to DevOps", "description": "Leverage your Python skills by learning Terraform. Your experience in CLI tools makes this a high-impact transition.", "category": "Skill"}},
          ...
        ]
        """

        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7, # Higher temp for more unique suggestions
                max_tokens=1024,
                timeout=20.0
            )
            
            response_text = completion.choices[0].message.content
            json_match = re.search(r'(\[.*\])', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1).strip())
            
            clean_json = re.sub(r"```json|```", "", response_text).strip()
            return json.loads(clean_json)
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return self._mock_recommendations()

    def _mock_recommendations(self):
        return [
            {"title": "Tactical Role: Full Stack Lead", "description": "Transition your React expertise into a Lead position by focusing on System Design patterns and architecting high-performance frontend pipelines.", "category": "Role"},
            {"title": "Bridge Skill: Rust for Performance", "description": "Incorporate Rust into your Python data scrapers. This provides a 10x throughput improvement for the mission-critical scouting nodes.", "category": "Skill"},
            {"title": "Network Hub: LinkedIn Open Source", "description": "Contribute to three major Node.js middleware projects to establish authority in the backend ecosystem and attract high-tier recruiter attention.", "category": "Network"}
        ]

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
