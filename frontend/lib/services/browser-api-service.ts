import { ApiService } from "./api";

class BrowserApiService extends ApiService {
  async connectProfile(userId: string, platform: string): Promise<any> {
    return this.request<any>(`/browser/connect?user_id=${userId}&platform=${platform}`, {
      method: "POST",
    });
  }

  async getProfileStatus(userId: string): Promise<any> {
    return this.request<any>(`/browser/${userId}/status`, {
      method: "GET",
    });
  }
  async fetchSessions(userId: string): Promise<any[]> {
    return this.request<any[]>(`/browser/sessions?user_id=${userId}`, {
      method: "GET",
    });
  }

  async checkSession(userId: string, platform: string): Promise<{active: boolean}> {
    return this.request<{active: boolean}>(`/browser/check-session?user_id=${userId}&platform=${platform}`, {
      method: "POST",
    });
  }
}

export const browserApiService = new BrowserApiService();
