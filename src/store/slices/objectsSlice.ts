import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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

/**
 * Создание нового объекта строительства
 * @param {Partial<ObjectEntity>} data - Данные объекта (title, address, description и т.д.)
 * @returns {Promise<ObjectEntity>} Созданный объект
 * @example
 * dispatch(createObject({ title: 'Дом Пушкина', address: 'ул. Пушкина, д. 10' }))
 */
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
      console.error('Create object error:', error);
      return rejectWithValue(error.message || 'Failed to create object');
    }
  }
);

/**
 * Обновление существующего объекта
 * @param {Object} params - Параметры обновления
 * @param {number} params.id - ID объекта
 * @param {Partial<ObjectEntity>} params.data - Новые данные объекта
 * @returns {Promise<ObjectEntity>} Обновленный объект
 * @example
 * dispatch(updateObject({ id: 1, data: { title: 'Новое название' } }))
 */
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
      console.error('Update object error:', error);
      return rejectWithValue(error.message || 'Failed to update object');
    }
  }
);

/**
 * Удаление объекта
 * @param {number} id - ID объекта для удаления
 * @returns {Promise<number>} ID удаленного объекта
 * @example
 * dispatch(deleteObject(123))
 */
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
      console.error('Delete object error:', error);
      return rejectWithValue(error.message || 'Failed to delete object');
    }
  }
);

const objectsSlice = createSlice({
  name: 'objects',
  initialState,
  reducers: {
    /**
     * Установка списка объектов (используется при загрузке данных пользователя)
     * @param {ObjectEntity[]} payload - Массив объектов
     */
    setObjects(state, action: PayloadAction<ObjectEntity[]>) {
      state.items = action.payload;
    },
    
    /**
     * Очистка ошибки
     */
    clearObjectsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create object
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

      // Update object
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

      // Delete object
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
