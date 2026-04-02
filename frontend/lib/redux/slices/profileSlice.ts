import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService, UserContext, ProfileInsights } from '@/lib/services/user-service';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getContext();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchInsights = createAsyncThunk(
  'profile/fetchInsights',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getInsights();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePlatformStatus = createAsyncThunk(
  'profile/updatePlatformStatus',
  async ({ platform, active }: { platform: string; active: boolean }, { rejectWithValue }) => {
    try {
      const data: any = {};
      data[`${platform}_active`] = active;
      return await userService.updateContext(data);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface ProfileState {
  context: UserContext | null;
  insights: ProfileInsights | null;
  isLoading: boolean;
  insightsLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  context: null,
  insights: null,
  isLoading: false,
  insightsLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.context = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInsights.pending, (state) => {
        state.insightsLoading = true;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.insightsLoading = false;
        state.insights = action.payload;
      })
      .addCase(fetchInsights.rejected, (state) => {
        state.insightsLoading = false;
      })
      .addCase(updatePlatformStatus.fulfilled, (state, action) => {
        state.context = action.payload;
      });
  },
});

export default profileSlice.reducer;
