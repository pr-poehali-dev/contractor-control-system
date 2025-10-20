import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface Contractor {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
  role?: string;
}

interface ContractorsState {
  items: Contractor[];
  loading: boolean;
  error: string | null;
}

const initialState: ContractorsState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Приглашение подрядчика в систему
 * @param {Object} data - Данные приглашения
 * @param {string} data.phone - Телефон подрядчика
 * @param {string} data.name - Имя подрядчика
 * @returns {Promise<any>} Результат приглашения
 * @example
 * dispatch(inviteContractor({ 
 *   phone: '+79001234567', 
 *   name: 'Иван Иванов'
 * }))
 */
export const inviteContractor = createAsyncThunk(
  'contractors/invite',
  async (data: { phone: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.CONTRACTORS.INVITE, data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to invite contractor');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Invite contractor error:', error);
      return rejectWithValue(error.message || 'Failed to invite contractor');
    }
  }
);

const contractorsSlice = createSlice({
  name: 'contractors',
  initialState,
  reducers: {
    /**
     * Установка списка подрядчиков (используется при загрузке данных пользователя)
     * @param {Contractor[]} payload - Массив подрядчиков
     */
    setContractors(state, action: PayloadAction<Contractor[]>) {
      state.items = action.payload;
    },
    
    /**
     * Очистка ошибки
     */
    clearContractorsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(inviteContractor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteContractor.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(inviteContractor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setContractors, clearContractorsError } = contractorsSlice.actions;
export default contractorsSlice.reducer;
