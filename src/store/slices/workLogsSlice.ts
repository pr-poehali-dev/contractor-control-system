import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface WorkLog {
  id: number;
  work_id: number;
  description: string;
  volume?: string;
  materials?: string;
  photo_urls?: string;
  created_by: number;
  created_at: string;
  author_name?: string;
  author_role?: 'contractor' | 'client';
  is_work_start?: boolean;
  progress?: number;
  completion_percentage?: number;
  is_inspection_start?: boolean;
  is_inspection_completed?: boolean;
  inspection_id?: number;
  defects_count?: number;
}

interface WorkLogsState {
  items: WorkLog[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkLogsState = {
  items: [],
  loading: false,
  error: null,
};

export const createWorkLog = createAsyncThunk(
  'workLogs/create',
  async (data: Partial<WorkLog>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, { type: 'work_log', data });
      if (!response.success) throw new Error(response.error || 'Failed to create work log');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const workLogsSlice = createSlice({
  name: 'workLogs',
  initialState,
  reducers: {
    setWorkLogs(state, action) {
      state.items = action.payload;
    },
    clearWorkLogsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createWorkLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkLog.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) state.items.push(action.payload.data);
      })
      .addCase(createWorkLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setWorkLogs, clearWorkLogsError } = workLogsSlice.actions;
export default workLogsSlice.reducer;
