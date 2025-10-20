import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface ObjectEntity {
  id: number;
  title: string;
  address?: string;
  description?: string;
  client_id: number;
  status: 'active' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

interface ObjectsState {
  items: ObjectEntity[];
  loading: boolean;
  error: string | null;
}

const initialState: ObjectsState = {
  items: [],
  loading: false,
  error: null,
};

export const createObject = createAsyncThunk(
  'objects/create',
  async (data: Partial<ObjectEntity>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, {
        type: 'object',
        data,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create object');
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateObject = createAsyncThunk(
  'objects/update',
  async ({ id, data }: { id: number; data: Partial<ObjectEntity> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.ENTITIES.UPDATE, {
        type: 'object',
        id,
        data,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update object');
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteObject = createAsyncThunk(
  'objects/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(ENDPOINTS.ENTITIES.DELETE, {
        data: { type: 'object', id },
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete object');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const objectsSlice = createSlice({
  name: 'objects',
  initialState,
  reducers: {
    setObjects(state, action) {
      state.items = action.payload;
    },
    clearObjectsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createObject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createObject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.items.push(action.payload.data);
        }
      })
      .addCase(createObject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateObject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateObject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          const index = state.items.findIndex((obj) => obj.id === action.payload.data.id);
          if (index !== -1) {
            state.items[index] = action.payload.data;
          }
        }
      })
      .addCase(updateObject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteObject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteObject.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((obj) => obj.id !== action.payload);
      })
      .addCase(deleteObject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setObjects, clearObjectsError } = objectsSlice.actions;
export default objectsSlice.reducer;
