import { ApiService } from "./api";

export interface ResumeData {
  id: number | null;
  user_id?: number;
  filename?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: any[];
  education: any[];
  updated_at?: string;
  message?: string;
}

class ResumeService extends ApiService {
  async getMyResume(userId: number): Promise<ResumeData> {
    return this.request<ResumeData>(`/resume/my/${userId}`, {
      method: "GET",
    });
  }

  async uploadResume(userId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("user_id", userId.toString());
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/resume/upload`, {
      method: "POST",
      body: formData,
      // Note: We don't set Content-Type here; browser does it for FormData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  }

  async syncResumeData(userId: number, data: Partial<ResumeData>): Promise<any> {
    return this.request<any>(`/resume/sync/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const resumeService = new ResumeService();
