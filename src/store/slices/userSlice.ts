import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface User {
  id: number;
  name: string;
  role: 'contractor' | 'client' | 'admin';
  email?: string;
  phone?: string;
  organization?: string;
  created_at?: string;
}

export interface Work {
  id: number;
  object_id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'delayed';
  contractor_id?: number;
  contractor_name?: string;
  start_date?: string;
  end_date?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserData {
  objects: any[];
  works: Work[];
  inspections: any[];
  remarks: any[];
  workLogs: any[];
  checkpoints: any[];
  contractors: any[];
  chatMessages?: any[];
  unreadCounts?: Record<number, { logs?: number; messages?: number; inspections?: number }>;
  defect_reports?: any[];
}

interface UserState {
  user: User | null;
  token: string | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: (() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  })(),
  token: localStorage.getItem('auth_token'),
  userData: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: true,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response.data as any;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const loginWithPhone = createAsyncThunk(
  'user/loginWithPhone',
  async ({ phone, code }: { phone: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_CODE, { phone, code });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response.data as any;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (data: {
    email?: string;
    phone?: string;
    password: string;
    name: string;
    role?: 'client' | 'contractor';
    organization?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }

      const { token, user } = response.data as any;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const loadUserData = createAsyncThunk(
  'user/loadUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.USER.DATA);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load user data');
      }

      return response.data as UserData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load user data');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'user/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await apiClient.get(ENDPOINTS.USER.DATA);
      
      if (!response.success) {
        throw new Error('Token invalid');
      }

      return true;
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return rejectWithValue(error.message || 'Token verification failed');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.userData = null;
      state.isAuthenticated = false;
      state.error = null;
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },
    setUserData(state, action: PayloadAction<UserData>) {
      state.userData = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      .addCase(loginWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      .addCase(loadUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, setUserData, clearError } = userSlice.actions;
export default userSlice.reducer;
