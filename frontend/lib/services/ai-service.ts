import { ApiService } from './api';

export interface Recommendation {
    title: string;
    description: string;
    category: 'Role' | 'Skill' | 'Network' | string;
}

export interface RecommendationResponse {
    recommendations: Recommendation[];
    last_refreshed: string;
}

class AIService extends ApiService {
    async fetchRecommendations(): Promise<RecommendationResponse> {
        return this.request<RecommendationResponse>('/ai/recommendations', {
            method: 'GET'
        });
    }

    async refreshRecommendations(): Promise<RecommendationResponse> {
        return this.request<RecommendationResponse>('/ai/recommendations/refresh', {
            method: 'POST'
        });
    }
}

export const aiService = new AIService();
