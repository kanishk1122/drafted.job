import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService, UserContext, ProfileInsights } from '@/lib/services/user-service';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (options: { force?: boolean } = {}, { rejectWithValue }) => {
    try {
      return await userService.getContext();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (options, { getState }) => {
      const { profile } = getState() as any;
      if (profile.isLoading) return false;
      
      // If force is true, we always allow the fetch
      if (options?.force) return true;

      // Profile context is heavy and static. Deep trust (1 hour).
      if (profile.context && (Date.now() - (profile as any).lastFetchedProfile < 3600000)) {
        return false;
      }
      return true;
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
  },
  {
    condition: (_, { getState }) => {
      const { profile } = getState() as any;
      if (profile.insightsLoading) return false;
      // Insights are dynamic but can be cached for 15 mins
      if (profile.insights && (Date.now() - (profile as any).lastFetchedInsights < 900000)) {
        return false;
      }
      return true;
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
  lastFetchedProfile: number;
  lastFetchedInsights: number;
}

const initialState: ProfileState = {
  context: null,
  insights: null,
  isLoading: false,
  insightsLoading: false,
  error: null,
  lastFetchedProfile: 0,
  lastFetchedInsights: 0,
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
        state.lastFetchedProfile = Date.now();
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
        state.lastFetchedInsights = Date.now();
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
