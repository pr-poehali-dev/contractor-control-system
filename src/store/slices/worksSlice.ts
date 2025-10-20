import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface WorkEntity {
  id: number;
  object_id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'delayed' | 'pending';
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

interface WorksState {
  items: WorkEntity[];
  loading: boolean;
  error: string | null;
}

const initialState: WorksState = {
  items: [],
  loading: false,
  error: null,
};

export const createWork = createAsyncThunk(
  'works/create',
  async (data: Partial<WorkEntity>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, { type: 'work', data });
      if (!response.success) throw new Error(response.error || 'Failed to create work');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWork = createAsyncThunk(
  'works/update',
  async ({ id, data }: { id: number; data: Partial<WorkEntity> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.ENTITIES.UPDATE, { type: 'work', id, data });
      if (!response.success) throw new Error(response.error || 'Failed to update work');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteWork = createAsyncThunk(
  'works/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(ENDPOINTS.ENTITIES.DELETE, {
        data: { type: 'work', id },
      });
      if (!response.success) throw new Error(response.error || 'Failed to delete work');
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const worksSlice = createSlice({
  name: 'works',
  initialState,
  reducers: {
    setWorks(state, action) {
      state.items = action.payload;
    },
    clearWorksError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createWork.fulfilled, (state, action) => {
        if (action.payload?.data) state.items.push(action.payload.data);
        state.loading = false;
      })
      .addCase(updateWork.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const index = state.items.findIndex((w) => w.id === action.payload.data.id);
          if (index !== -1) state.items[index] = action.payload.data;
        }
        state.loading = false;
      })
      .addCase(deleteWork.fulfilled, (state, action) => {
        state.items = state.items.filter((w) => w.id !== action.payload);
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.startsWith('works/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('works/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { setWorks, clearWorksError } = worksSlice.actions;
export default worksSlice.reducer;
