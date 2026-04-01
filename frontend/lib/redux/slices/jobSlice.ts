import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jobService, Job, JobSummary, JobFilterParams, JobCreate } from "@/lib/services/job-service";

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
      const { job } = getState() as RootState;
      const platform = params.platform || "ALL";
      const lastFetched = job.lastFetchedByPlatform[platform];
      const now = Date.now();
      
      // If we already have jobs and it's been less than 5 minutes, skip
      if (lastFetched && (now - lastFetched < 300000) && job.jobs.length > 0) {
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
