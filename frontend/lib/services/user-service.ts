import { ApiService } from "./api";

export interface UserContext {
  id?: number;
  full_name: string;
  email: string;
  target_roles?: string;
  skills?: string;
  salary_floor?: number;
  has_resume?: boolean;
  linkedin_active: boolean;
  linkedin_email?: string;
  naukri_active: boolean;
  naukri_email?: string;
  indeed_active: boolean;
  foundit_active: boolean;
  glassdoor_active: boolean;
  ambitionbox_active: boolean;
  instahyre_active?: boolean;
  // Computed by backend: only platforms where _active === true
  active_platforms: string[];
}

class UserService extends ApiService {
  async getContext(): Promise<UserContext> {
    // Use /user/me (cookie-authenticated) to get the correct logged-in user
    return this.request<UserContext>("/user/me", {
      method: "GET",
    });
  }

  async updateContext(data: Partial<UserContext>): Promise<UserContext> {
    return this.request<UserContext>("/user/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const userService = new UserService();
