from pydantic import BaseModel
from typing import Optional, List

class PipelineStat(BaseModel):
    value: str
    change: str
    label: str

class ActivityPoint(BaseModel):
    date: str
    count: int

class ActivityChartData(BaseModel):
    points: List[ActivityPoint]

class DashboardStats(BaseModel):
    jobs_discovered: PipelineStat
    forms_submitted: PipelineStat
    positive_responses: PipelineStat
    interviews_done: PipelineStat
    activity_chart: ActivityChartData
