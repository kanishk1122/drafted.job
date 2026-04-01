import { ApiService } from "./api";

export interface DashboardStat {
  value: string;
  change: string;
  label: string;
}

export interface DashboardStatsResponse {
  jobs_discovered: DashboardStat;
  forms_submitted: DashboardStat;
  positive_responses: DashboardStat;
  interviews_done: DashboardStat;
  activity_chart: {
    points: Array<{ date: string; count: number }>;
  };
}

class PipelineService extends ApiService {
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return this.request<DashboardStatsResponse>("/pipeline/dashboard-stats", {
      method: "GET",
    });
  }
}

export const pipelineService = new PipelineService();
