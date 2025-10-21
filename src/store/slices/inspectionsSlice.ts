import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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

/**
 * Создание новой проверки работы
 * @param {Partial<Inspection>} data - Данные проверки (title, work_id, type и т.д.)
 * @returns {Promise<Inspection>} Созданная проверка
 * @example
 * dispatch(createInspection({ 
 *   title: 'Проверка монтажа', 
 *   work_id: 123,
 *   type: 'scheduled'
 * }))
 */
export const createInspection = createAsyncThunk(
  'inspections/create',
  async (data: Partial<Inspection>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, { type: 'inspection', data });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create inspection');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Create inspection error:', error);
      return rejectWithValue(error.message || 'Failed to create inspection');
    }
  }
);

/**
 * Обновление существующей проверки
 * @param {Object} params - Параметры обновления
 * @param {number} params.id - ID проверки
 * @param {Partial<Inspection>} params.data - Новые данные проверки
 * @returns {Promise<Inspection>} Обновленная проверка
 * @example
 * dispatch(updateInspection({ id: 1, data: { status: 'completed', notes: 'Все хорошо' } }))
 */
export const updateInspection = createAsyncThunk(
  'inspections/update',
  async ({ id, data }: { id: number; data: Partial<Inspection> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.ENTITIES.UPDATE, { type: 'inspection', id, data });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update inspection');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Update inspection error:', error);
      return rejectWithValue(error.message || 'Failed to update inspection');
    }
  }
);

const inspectionsSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    /**
     * Установка списка проверок (используется при загрузке данных пользователя)
     * @param {Inspection[]} payload - Массив проверок
     */
    setInspections(state, action: PayloadAction<Inspection[]>) {
      console.log('✅ inspectionsSlice.setInspections called with:', action.payload.length, 'items');
      state.items = action.payload;
    },
    
    /**
     * Очистка ошибки
     */
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