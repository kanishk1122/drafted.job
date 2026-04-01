import { ApiService } from "./api";

export interface AuthResponse {
  full_name: string;
  email: string;
}

class AuthService extends ApiService {
  async login(credentials: { email: string; password: any }): Promise<AuthResponse> {
    return this.request<AuthResponse>("/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: { full_name: string; email: string; password: any }): Promise<AuthResponse> {
    return this.request<AuthResponse>("/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<AuthResponse> {
    return this.request<AuthResponse>("/user/me", {
      method: "GET",
    });
  }

  async logout(): Promise<void> {
    await this.request<void>("/user/logout", {
      method: "POST",
    });
  }
}

export const authService = new AuthService();
