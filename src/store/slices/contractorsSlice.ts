import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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

export const inviteContractor = createAsyncThunk(
  'contractors/invite',
  async (data: { phone: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.CONTRACTORS.INVITE, data);
      if (!response.success) throw new Error(response.error || 'Failed to invite contractor');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const contractorsSlice = createSlice({
  name: 'contractors',
  initialState,
  reducers: {
    setContractors(state, action) {
      state.items = action.payload;
    },
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
