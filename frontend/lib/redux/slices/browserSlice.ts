import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { browserApiService } from '@/lib/services/browser-api-service';
import { RootState } from '../store';

export interface SearchSession {
  id: string | number;
  name: string;
  platform?: string;
  status: 'active' | 'completed' | 'failed' | 'idle';
  error?: string;
  date: string;
  totalJobs: number;
  breakdown: {
    platform: string;
    logo: string;
    count: number;
  }[];
  progress?: number;
  results?: number;
  startTime?: string;
  endTime?: string;
  mission_state?: any;
}

interface BrowserState {
  sessions: SearchSession[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  hasMore: boolean;
  page: number;
}

const initialState: BrowserState = {
  sessions: [],
  loading: false,
  error: null,
  lastFetched: null,
  hasMore: true,
  page: 0,
};

export const fetchBrowserSessions = createAsyncThunk(
  'browser/fetchSessions',
  async ({ userId, skip = 0, limit = 20 }: { userId: string; skip?: number; limit?: number }, { rejectWithValue }) => {
    try {
      return await browserApiService.fetchSessions(userId, skip, limit);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: ({ skip = 0 }, { getState }) => {
      const { browser } = getState() as RootState;
      // SKIP FETCH if we have sessions and they were fetched recently (last 2 mins) AND it's not a pagination request
      const now = Date.now();
      if (skip === 0 && browser.sessions.length > 0 && browser.lastFetched && (now - browser.lastFetched < 120000)) {
        return false;
      }
      return true;
    }
  }
);

export const deleteBrowserSession = createAsyncThunk(
  'browser/deleteSession',
  async ({ sessionId, userId }: { sessionId: number | string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await browserApiService.deleteSession(sessionId, userId);
      return { sessionId, success: response.success };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const browserSlice = createSlice({
  name: 'browser',
  initialState,
  reducers: {
    addLocalSession: (state, action: PayloadAction<SearchSession>) => {
      state.sessions = [action.payload, ...state.sessions];
    },
    updateSessionLocally: (state, action: PayloadAction<Partial<SearchSession> & { id: string }>) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = { ...state.sessions[index], ...action.payload };
      }
    },
    resetPagination: (state) => {
      state.page = 0;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrowserSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrowserSessions.fulfilled, (state, action) => {
        state.loading = false;
        const newSessions = action.payload;
        const skip = action.meta.arg.skip || 0;
        
        if (skip === 0) {
          state.sessions = newSessions;
        } else {
          // Append and remove duplicates just in case
          const existingIds = new Set(state.sessions.map(s => String(s.id)));
          const filtered = newSessions.filter(s => !existingIds.has(String(s.id)));
          state.sessions = [...state.sessions, ...filtered];
        }
        
        state.hasMore = newSessions.length === (action.meta.arg.limit || 20);
        state.page = skip === 0 ? 1 : state.page + 1;
        state.lastFetched = Date.now();
      })
      .addCase(fetchBrowserSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBrowserSession.fulfilled, (state, action) => {
        if (action.payload.success) {
           state.sessions = state.sessions.filter(s => s.id !== action.payload.sessionId);
        }
      });
  },
});

export const { addLocalSession, updateSessionLocally, resetPagination } = browserSlice.actions;
export default browserSlice.reducer;
