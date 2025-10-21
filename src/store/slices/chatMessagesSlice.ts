import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface ChatMessage {
  id: number;
  work_id: number;
  created_by: number;
  author_name?: string;
  author_role?: 'contractor' | 'client';
  message: string;
  message_type?: string;
  photo_urls?: string;
  created_at: string;
}

interface ChatMessagesState {
  items: ChatMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatMessagesState = {
  items: [],
  loading: false,
  error: null,
};

export const createChatMessage = createAsyncThunk(
  'chatMessages/create',
  async (data: { work_id: number; message: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, { 
        type: 'chat_message', 
        data 
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create chat message');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Create chat message error:', error);
      return rejectWithValue(error.message || 'Failed to create chat message');
    }
  }
);

const chatMessagesSlice = createSlice({
  name: 'chatMessages',
  initialState,
  reducers: {
    setChatMessages(state, action: PayloadAction<ChatMessage[]>) {
      console.log('✅ chatMessagesSlice.setChatMessages called with:', action.payload.length, 'items');
      state.items = action.payload;
    },
    
    clearChatMessagesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) state.items.push(action.payload.data);
      })
      .addCase(createChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setChatMessages, clearChatMessagesError } = chatMessagesSlice.actions;
export default chatMessagesSlice.reducer;