from openai import OpenAI
from app.core.config import settings
import json

class AIService:
    def __init__(self):
        self.api_key = settings.nvidia_api_key
        # NVIDIA NIM API endpoint
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=self.api_key
        )

    async def extract_intent(self, user_message: str):
        if not self.api_key:
            # Fallback for testing if no API key is provided
            print("Warning: NVIDIA_API_KEY not set. Using mock extraction.")
            return self._mock_extraction(user_message)

        prompt = f"""
        Extract the professional intent from the following user bio/message.
        Identify the role, years of experience, key skills, and primary goal (e.g., job search).
        Return the result ONLY as a valid JSON object.

        Message: "{user_message}"

        JSON format:
        {{
            "role": "string",
            "experience_years": integer,
            "skills": ["string"],
            "primary_goal": "string",
            "summary": "string"
        }}
        """

        try:
            completion = self.client.chat.completions.create(
                model=settings.nvidia_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                top_p=0.7,
                max_tokens=1024,
            )
            
            response_text = completion.choices[0].message.content
            # Cleanup potential markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            return json.loads(response_text)
        except Exception as e:
            print(f"Error calling NVIDIA NIM: {e}")
            return self._mock_extraction(user_message)

    async def parse_resume(self, resume_text: str):
        if not self.api_key:
            return self._mock_resume_parsing(resume_text)

        prompt = f"""
        Extract professional information from the following resume text.
        Structure the output as a valid JSON object containing:
        - full_name
        - email
        - phone
        - location
        - summary
        - skills (as a list)
        - experience (as a list of objects with title, company, duration, description)
        - education (as a list of objects)

        Resume Text: "{resume_text}"

        JSON format:
        {{
            "full_name": "string",
            "email": "string",
            "phone": "string",
            "location": "string",
            "summary": "string",
            "skills": ["string"],
            "experience": [{{ "title": "string", "company": "string", "duration": "string", "description": "string" }}],
            "education": [{{ "degree": "string", "institution": "string", "year": "string" }}]
        }}
        """

        try:
            completion = self.client.chat.completions.create(
                model=settings.nvidia_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2048,
            )
            
            response_text = completion.choices[0].message.content
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            return json.loads(response_text)
        except Exception as e:
            print(f"Error parsing resume via NVIDIA NIM: {e}")
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
        # Very basic fallback logic for demonstration if API fails or key is missing
        message_lower = message.lower()
        role = "Software Developer"
        if "python" in message_lower: role = "Python Developer"
        if "frontend" in message_lower: role = "Frontend Developer"
        
        return {
            "role": role,
            "experience_years": 4, # Just a placeholder
            "skills": ["Python", "RESTful API"] if "python" in message_lower else [],
            "primary_goal": "Job Search",
            "summary": "Extracted intent from user message (Mocked due to missing API key)"
        }

ai_service = AIService()
