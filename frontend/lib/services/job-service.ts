import { ApiService } from "./api";

/** Lightweight summary — returned by GET /jobs/ list endpoint */
export interface JobSummary {
  id: number;
  title: string;
  company: string;
  platform: string;
  location: string;
  salary: string;
  heuristic_score: number;
  status: string;
  created_at?: string;
  url?: string;
}

/** Full job detail — returned by GET /jobs/{id} when user selects a job */
export interface Job {
  id: number;
  user_id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  platform: string;
  salary: string;
  currency: string;
  tech_stack: string; // JSON string
  heuristic_score: number;
  match_reason: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JobFilterParams {
  status?: string;
  platform?: string;
  min_score?: number;
  q?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  limit?: number;
  offset?: number;
}

export interface JobCreate {
  title: string;
  company: string;
  location?: string;
  platform: string;
  url?: string;
  status?: string;
  heuristic_score?: number;
  description?: string;
  tech_stack?: string[];
}

class JobService extends ApiService {
  /** Fetch lightweight job summaries for list/kanban views */
  async fetchJobs(params: JobFilterParams = {}): Promise<JobSummary[]> {
    const queryParts = [];
    if (params.status) queryParts.push(`status=${params.status}`);
    if (params.platform) queryParts.push(`platform=${params.platform}`);
    if (params.min_score !== undefined) queryParts.push(`min_score=${params.min_score}`);
    if (params.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
    if (params.start_date) queryParts.push(`start_date=${params.start_date}`);
    if (params.end_date) queryParts.push(`end_date=${params.end_date}`);
    if (params.sort_by) queryParts.push(`sort_by=${params.sort_by}`);
    if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
    if (params.offset !== undefined) queryParts.push(`offset=${params.offset}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    return this.request<JobSummary[]>(`/jobs/${queryString}`, { method: "GET" });
  }

  /** Fetch complete job details — called only when user selects a specific job */
  async fetchJobById(jobId: number): Promise<Job> {
    return this.request<Job>(`/jobs/${jobId}`, { method: "GET" });
  }

  async updateJobStatus(jobId: number, status: string): Promise<Job> {
    return this.request<Job>(`/jobs/${jobId}/status?status=${status}`, {
      method: "PATCH",
    });
  }

  async getJobMetrics(): Promise<any> {
    return this.request<any>("/jobs/metrics", { method: "GET" });
  }

  async createJob(data: JobCreate): Promise<Job> {
    return this.request<Job>("/jobs/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteJob(jobId: number): Promise<{ status: string; id: number }> {
    return this.request<{ status: string; id: number }>(`/jobs/${jobId}`, {
      method: "DELETE",
    });
  }
}

export const jobService = new JobService();
