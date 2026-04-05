import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jobService, Job, JobSummary, JobFilterParams, JobCreate } from "@/lib/services/job-service";
import { fetchBrowserSessions } from "./browserSlice";

export const createManualJob = createAsyncThunk(
  "job/createManual",
  async (data: JobCreate, { rejectWithValue }) => {
    try {
      return await jobService.createJob(data);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);
import { RootState } from "../store";

interface JobState {
  jobs: JobSummary[];
  fullJobs: Record<number, Job>; // Cache for full job details
  metrics: any | null;
  loading: boolean;
  detailLoading: boolean;
  selectedJobId: number | null;
  error: string | null;
  hasMore: boolean;
  offset: number;
  lastFetchedByPlatform: Record<string, number>; // Cache timestamps
  metricsLastFetched: number;
  metricsLoading: boolean;
  isStale: boolean;
  hasActiveSessionPreviously: boolean;
}

const initialState: JobState = {
  jobs: [],
  fullJobs: {},
  metrics: null,
  loading: false,
  detailLoading: false,
  selectedJobId: null,
  error: null,
  hasMore: true,
  offset: 0,
  lastFetchedByPlatform: {},
  metricsLastFetched: 0,
  metricsLoading: false,
  isStale: false,
  hasActiveSessionPreviously: false,
};

export const fetchJobs = createAsyncThunk(
  "job/fetchJobs",
  async (params: JobFilterParams, { rejectWithValue }) => {
    try {
      return await jobService.fetchJobs(params);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (params, { getState }) => {
      const { job, browser } = getState() as RootState;
      if (job.loading) return false; // COLLISION GUARD

      const platform = (params as any).platform || "ALL";
      const lastFetched = (job as any).lastFetchedByPlatform?.[platform] || 0;
      const now = Date.now();
      
      // MISSION-AWARE CACHE: If no active scout is running, trust the existing vault data
      const isScoutRunning = browser.sessions.some(s => s.status === 'active' || (s as any).status === 'running');
      const hasContent = job.jobs.length > 0;
      
      const isPagination = (params as any).offset > 0;
      const isDateFilter = !!((params as any).start_date || (params as any).end_date);
      
      if (!isScoutRunning && hasContent && !job.isStale && !(params as any).forceRefresh && !isPagination && !isDateFilter) {
        // Clinical Skip: No mission active, vault already populated AND not stale. Trust memory (30 min).
        if (now - lastFetched < 1800000) {
            return false;
        }
      }

      // If scout IS running, limit polling to every 30s to see progress
      if (isScoutRunning && hasContent && (now - lastFetched < 30000) && !isPagination && !isDateFilter) {
        return false;
      }

      return true;
    }
  }
);

export const fetchJobDetail = createAsyncThunk(
  "job/fetchDetail",
  async (jobId: number, { rejectWithValue }) => {
    try {
      return await jobService.fetchJobById(jobId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
  {
    // SMART FETCH: Only call API if we don't have the full description/tech_stack already
    condition: (jobId, { getState }) => {
      const { job } = getState() as RootState;
      const cached = job.fullJobs[jobId];
      // If we have it and it has the heavy fields, skip network call
      if (cached && cached.description && cached.tech_stack) {
        return false;
      }
      return true;
    }
  }
);

export const updateJobStatus = createAsyncThunk(
  "job/updateStatus",
  async ({ jobId, status }: { jobId: number; status: string }, { rejectWithValue }) => {
    try {
      return await jobService.updateJobStatus(jobId, status);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchJobMetrics = createAsyncThunk(
  "job/fetchMetrics",
  async (_, { rejectWithValue }) => {
    try {
      return await jobService.getJobMetrics();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { job, browser } = getState() as RootState;
      const metricsLastFetched = (job as any).metricsLastFetched || 0;
      const now = Date.now();
      
      const isScoutRunning = browser.sessions.some(s => s.status === 'active' || (s as any).status === 'running');

      if (!isScoutRunning && job.metrics && !job.isStale && (now - metricsLastFetched < 1800000)) {
        return false;
      }
      
      if (isScoutRunning && job.metrics && (now - metricsLastFetched < 30000)) {
        return false;
      }

      return true;
    }
  }
);

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (jobId: number, { rejectWithValue }) => {
    try {
      return await jobService.deleteJob(jobId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    resetJobs: (state) => {
      state.jobs = [];
      state.offset = 0;
      state.hasMore = true;
    },
    incrementOffset: (state, action: PayloadAction<number>) => {
      state.offset += action.payload;
    },
    setSelectedJobId: (state, action: PayloadAction<number | null>) => {
      state.selectedJobId = action.payload;
    },
    // Manual cache update if needed
    setSelectedJob: (state, action: PayloadAction<Job | null>) => {
      if (action.payload) {
        state.fullJobs[action.payload.id] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.isStale = false; // SYNCHRONIZED
        const platform = action.meta.arg.platform || "ALL";
        state.lastFetchedByPlatform[platform] = Date.now();

        const limit = action.meta.arg.limit || 50;
        if (action.payload.length < limit) {
          state.hasMore = false;
        }
        
        // Append new summaries, avoid duplicates
        const newSummaries = action.payload.filter(
          (s) => !state.jobs.some((existing) => existing.id === s.id)
        );
        state.jobs = [...state.jobs, ...newSummaries];
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.fullJobs[action.payload.id] = action.payload;
      })
      .addCase(fetchJobDetail.rejected, (state) => {
        state.detailLoading = false;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.jobs = state.jobs.filter((j) => j.id !== id);
        delete state.fullJobs[id];
        if (state.selectedJobId === id) {
          state.selectedJobId = null;
        }
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        // Track the old status for accurate metric adjustment
        const targetId = action.payload.id;
        const oldStatus = state.fullJobs[targetId]?.status || 
                           state.jobs.find(j => j.id === targetId)?.status;
        const newStatus = action.payload.status;

        // Update summaries
        const index = state.jobs.findIndex((j) => j.id === targetId);
        if (index !== -1) {
          state.jobs[index].status = newStatus;
        }
        // Update detailed cache
        state.fullJobs[targetId] = action.payload;

        // INDUSTRIAL SYNC: Manually update metrics avoid network chatter
        if (state.metrics && oldStatus !== newStatus) {
           const s_old = (oldStatus || "").toLowerCase();
           const s_new = (newStatus || "").toLowerCase();

           if (s_new === 'applied') state.metrics.manual_apps++;
           if (s_old === 'applied') state.metrics.manual_apps--;
           
           if (s_new === 'interview') state.metrics.interviews++;
           if (s_old === 'interview') state.metrics.interviews--;
        }
      })
      .addCase(fetchJobMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
        state.metricsLastFetched = Date.now();
        state.isStale = false; // SYNCHRONIZED
        state.metricsLoading = false;
      })
      .addCase(fetchJobMetrics.pending, (state) => {
        state.metricsLoading = true;
      })
      .addCase(fetchJobMetrics.rejected, (state) => {
        state.metricsLoading = false;
      })
      .addCase(fetchBrowserSessions.fulfilled, (state, action) => {
        const currentlyActive = action.payload.some((s: any) => s.status === 'active' || s.status === 'running');
        // CRITICAL SYNC: If mission just transitioned to COMPLETED, flag vault as stale
        if (!currentlyActive && state.hasActiveSessionPreviously) {
          state.isStale = true;
        }
        state.hasActiveSessionPreviously = currentlyActive;
      })
      .addCase(createManualJob.fulfilled, (state, action) => {
        // Add to list and full cache
        state.jobs.unshift({
           id: action.payload.id,
           title: action.payload.title,
           company: action.payload.company,
           platform: action.payload.platform,
           location: action.payload.location,
           heuristic_score: action.payload.heuristic_score,
           status: action.payload.status,
           salary: action.payload.salary
        });
        state.fullJobs[action.payload.id] = action.payload;
      });
  },
});

export const { resetJobs, incrementOffset, setSelectedJob, setSelectedJobId } = jobSlice.actions;

export default jobSlice.reducer;
