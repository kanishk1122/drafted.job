import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pipelineService, DashboardStatsResponse } from '@/lib/services/pipeline-service';

interface PipelineState {
  stats: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PipelineState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'pipeline/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await pipelineService.getDashboardStats();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStatsResponse>) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default pipelineSlice.reducer;
