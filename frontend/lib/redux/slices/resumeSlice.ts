import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resumeService, ResumeData } from '@/lib/services/resume-service';

export const fetchMyResume = createAsyncThunk(
  'resume/fetchMyResume',
  async (userId: number, { rejectWithValue }) => {
    try {
      return await resumeService.getMyResume(userId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const uploadUserResume = createAsyncThunk(
  'resume/uploadResume',
  async ({ userId, file }: { userId: number; file: File }, { rejectWithValue }) => {
    try {
      return await resumeService.uploadResume(userId, file);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateResume = createAsyncThunk(
  'resume/updateResume',
  async ({ userId, data }: { userId: number; data: Partial<ResumeData> }, { rejectWithValue }) => {
    try {
      return await resumeService.syncResumeData(userId, data);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface ResumeState {
  data: ResumeData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  uploadStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ResumeState = {
  data: null,
  status: 'idle',
  uploadStatus: 'idle',
  error: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    clearResumeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyResume.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyResume.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchMyResume.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(uploadUserResume.pending, (state) => {
        state.uploadStatus = 'loading';
      })
      .addCase(uploadUserResume.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.data = action.payload.professional_data;
      })
      .addCase(uploadUserResume.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        if (state.data) {
          // Re-fetch or merge logic could go here, but for simplicity we assume the caller will trigger a re-fetch
          // or we can update the specific fields if the response returns the full object.
          // Since our backend returns a message, we'll let the component re-fetch.
        }
      });
  },
});

export const { clearResumeError } = resumeSlice.actions;
export default resumeSlice.reducer;
