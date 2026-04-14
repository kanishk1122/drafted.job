import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/lib/services/auth-service';

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Session validation failed');
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState() as any;
      if (auth.isAuthenticated && auth.userEmail) {
        // Clinical skip if already authenticated
        return false;
      }
      return true;
    }
  }
);

interface AuthState {
  userId: number | null;
  userEmail: string | null;
  fullName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  userId: typeof window !== 'undefined' ? Number(localStorage.getItem('user_id')) || null : null,
  userEmail: typeof window !== 'undefined' ? localStorage.getItem('user_email') : null,
  fullName: typeof window !== 'undefined' ? localStorage.getItem('full_name') : null,
  isAuthenticated: typeof window !== 'undefined' ? localStorage.getItem('is_authenticated') === 'true' : false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ id: number; email: string; full_name: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.userId = action.payload.id;
      state.userEmail = action.payload.email;
      state.fullName = action.payload.full_name;
      state.error = null;
      if (typeof window !== 'undefined') {
        if (action.payload.id) localStorage.setItem('user_id', action.payload.id.toString());
        localStorage.setItem('user_email', action.payload.email);
        localStorage.setItem('full_name', action.payload.full_name);
        localStorage.setItem('is_authenticated', 'true');
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('is_authenticated');
      }
    },
    logout: (state) => {
      state.userId = null;
      state.userEmail = null;
      state.fullName = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('full_name');
        localStorage.removeItem('is_authenticated');
      }
    },
    setAuth: (state, action: PayloadAction<{ id: number | null; email: string | null; full_name: string | null }>) => {
      state.userId = action.payload.id;
      state.userEmail = action.payload.email;
      state.fullName = action.payload.full_name;
      state.isAuthenticated = !!action.payload.email;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.userId = action.payload.id;
        state.userEmail = action.payload.email;
        state.fullName = action.payload.full_name;
        if (typeof window !== 'undefined') {
          if (action.payload.id) localStorage.setItem('user_id', action.payload.id.toString());
          localStorage.setItem('user_email', action.payload.email);
          localStorage.setItem('full_name', action.payload.full_name);
          localStorage.setItem('is_authenticated', 'true');
        }
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.userEmail = null;
        state.fullName = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_email');
          localStorage.removeItem('full_name');
          localStorage.removeItem('is_authenticated');
        }
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setAuth } = authSlice.actions;
export default authSlice.reducer;
