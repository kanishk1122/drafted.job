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
  },
  {
    // Caching logic: don't fetch if we already have it
    condition: (userId, { getState }) => {
      const { resume } = getState() as any;
      if (resume.data && resume.status === 'succeeded') {
        return false;
      }
      return true;
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
        state.data = {
          ...action.payload,
          ...action.payload.professional_data
        };
        state.status = 'succeeded';
      })
      .addCase(uploadUserResume.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
      });
  },
});

export const { clearResumeError } = resumeSlice.actions;
export default resumeSlice.reducer;
