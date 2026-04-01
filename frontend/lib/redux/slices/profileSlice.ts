import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService, UserContext } from '@/lib/services/user-service';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getContext();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { profile } = getState() as any;
      if (profile.context && !profile.error) {
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
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  context: null,
  isLoading: false,
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
      .addCase(updatePlatformStatus.fulfilled, (state, action) => {
        state.context = action.payload;
      });
  },
});

export default profileSlice.reducer;
