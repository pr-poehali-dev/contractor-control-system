import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface Inspection {
  id: number;
  work_id: number;
  work_log_id?: number;
  inspection_number: string;
  created_by: number;
  status: 'draft' | 'active' | 'completed';
  notes?: string;
  description?: string;
  defects?: string;
  photo_urls?: string;
  created_at: string;
  completed_at?: string;
  scheduled_date?: string;
  type: 'scheduled' | 'unscheduled';
  title: string;
  author_name?: string;
  author_role?: string;
}

interface InspectionsState {
  items: Inspection[];
  loading: boolean;
  error: string | null;
}

const initialState: InspectionsState = {
  items: [],
  loading: false,
  error: null,
};

export const createInspection = createAsyncThunk(
  'inspections/create',
  async (data: Partial<Inspection>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, { type: 'inspection', data });
      if (!response.success) throw new Error(response.error || 'Failed to create inspection');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInspection = createAsyncThunk(
  'inspections/update',
  async ({ id, data }: { id: number; data: Partial<Inspection> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.ENTITIES.UPDATE, { type: 'inspection', id, data });
      if (!response.success) throw new Error(response.error || 'Failed to update inspection');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const inspectionsSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    setInspections(state, action) {
      state.items = action.payload;
    },
    clearInspectionsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInspection.fulfilled, (state, action) => {
        if (action.payload?.data) state.items.push(action.payload.data);
        state.loading = false;
      })
      .addCase(updateInspection.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const index = state.items.findIndex((i) => i.id === action.payload.data.id);
          if (index !== -1) state.items[index] = action.payload.data;
        }
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.startsWith('inspections/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('inspections/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { setInspections, clearInspectionsError } = inspectionsSlice.actions;
export default inspectionsSlice.reducer;
