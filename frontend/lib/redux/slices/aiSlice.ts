import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiService, Recommendation } from '@/lib/services/ai-service';

export const fetchRecommendations = createAsyncThunk(
    'ai/fetchRecommendations',
    async (_, { rejectWithValue }) => {
        try {
            return await aiService.fetchRecommendations();
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || err.message);
        }
    }
);

export const refreshRecommendations = createAsyncThunk(
    'ai/refreshRecommendations',
    async (_, { rejectWithValue }) => {
        try {
            return await aiService.refreshRecommendations();
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.detail || err.message);
        }
    }
);

interface AIState {
    recommendations: Recommendation[];
    lastRefreshed: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AIState = {
    recommendations: [],
    lastRefreshed: null,
    loading: false,
    error: null,
};

const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecommendations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecommendations.fulfilled, (state, action) => {
                state.loading = false;
                state.recommendations = action.payload.recommendations;
                state.lastRefreshed = action.payload.last_refreshed;
            })
            .addCase(fetchRecommendations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(refreshRecommendations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshRecommendations.fulfilled, (state, action) => {
                state.loading = false;
                state.recommendations = action.payload.recommendations;
                state.lastRefreshed = action.payload.last_refreshed;
            })
            .addCase(refreshRecommendations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearError } = aiSlice.actions;
export default aiSlice.reducer;
