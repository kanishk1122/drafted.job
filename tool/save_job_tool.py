import pandas as pd
import numpy as np
import os
from datetime import datetime
from pydantic import BaseModel, Field

from browser_use import Tools


# 1️⃣ Define input schema (VERY IMPORTANT)
class SaveJobInput(BaseModel):
    company: str = Field(..., description="Company name")
    title: str = Field(..., description="Job title")
    location: str = Field(..., description="Job location")
    experience: str = Field(..., description="Experience required")
    skills: str = Field(..., description="Key skills")
    url: str = Field(..., description="Job URL")


# 2️⃣ Define the Tool
class SaveJobTool(Tools):
    name = "save_job"
    description = "Save a job listing to CSV file"
    args_schema = SaveJobInput

    def run(
        self,
        company: str,
        title: str,
        location: str,
        experience: str,
        skills: str,
        url: str,
    ):
        filename = "naukri_jobs.csv"

        row = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "company": company,
            "title": title,
            "location": location,
            "experience": experience,
            "skills": skills,
            "url": url,
        }

        # If file exists → append
        if os.path.exists(filename):
            df = pd.read_csv(filename)
            df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
        else:
            df = pd.DataFrame([row])

        # Clean index using numpy
        df.index = np.arange(1, len(df) + 1)

        df.to_csv(filename, index=False, encoding="utf-8")

        return f"✅ Job saved: {company} - {title}"
