import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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

/**
 * Создание новой работы на объекте
 * @param {Partial<WorkEntity>} data - Данные работы (title, object_id, contractor_id и т.д.)
 * @returns {Promise<WorkEntity>} Созданная работа
 * @example
 * dispatch(createWork({ 
 *   title: 'Монтаж вентиляции', 
 *   object_id: 123,
 *   contractor_id: 456
 * }))
 */
export const createWork = createAsyncThunk(
  'works/create',
  async (data: Partial<WorkEntity>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, { type: 'work', data });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create work');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Create work error:', error);
      return rejectWithValue(error.message || 'Failed to create work');
    }
  }
);

/**
 * Обновление существующей работы
 * @param {Object} params - Параметры обновления
 * @param {number} params.id - ID работы
 * @param {Partial<WorkEntity>} params.data - Новые данные работы
 * @returns {Promise<WorkEntity>} Обновленная работа
 * @example
 * dispatch(updateWork({ id: 1, data: { status: 'completed', completion_percentage: 100 } }))
 */
export const updateWork = createAsyncThunk(
  'works/update',
  async ({ id, data }: { id: number; data: Partial<WorkEntity> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.ENTITIES.UPDATE, { type: 'work', id, data });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update work');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Update work error:', error);
      return rejectWithValue(error.message || 'Failed to update work');
    }
  }
);

/**
 * Удаление работы
 * @param {number} id - ID работы для удаления
 * @returns {Promise<number>} ID удаленной работы
 * @example
 * dispatch(deleteWork(123))
 */
export const deleteWork = createAsyncThunk(
  'works/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(ENDPOINTS.ENTITIES.DELETE, {
        data: { type: 'work', id },
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete work');
      }
      
      return id;
    } catch (error: any) {
      console.error('Delete work error:', error);
      return rejectWithValue(error.message || 'Failed to delete work');
    }
  }
);

const worksSlice = createSlice({
  name: 'works',
  initialState,
  reducers: {
    /**
     * Установка списка работ (используется при загрузке данных пользователя)
     * @param {WorkEntity[]} payload - Массив работ
     */
    setWorks(state, action: PayloadAction<WorkEntity[]>) {
      state.items = action.payload;
    },
    
    /**
     * Очистка ошибки
     */
    clearWorksError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create work
      .addCase(createWork.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
        state.loading = false;
      })
      
      // Update work
      .addCase(updateWork.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex((w) => w.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
        state.loading = false;
      })
      
      // Delete work
      .addCase(deleteWork.fulfilled, (state, action) => {
        state.items = state.items.filter((w) => w.id !== action.payload);
        state.loading = false;
      })
      
      // Общий обработчик pending для всех async actions
      .addMatcher(
        (action) => action.type.startsWith('works/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      
      // Общий обработчик rejected для всех async actions
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