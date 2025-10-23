import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

interface InfoPost {
  id: number;
  title: string;
  content: string;
  link?: string;
  created_at: string;
  created_by: number;
}

interface InfoPostsState {
  items: InfoPost[];
  loading: boolean;
  error: string | null;
}

const initialState: InfoPostsState = {
  items: [],
  loading: false,
  error: null,
};

export const createInfoPost = createAsyncThunk(
  'infoPosts/create',
  async (data: { title: string; content: string; link?: string }) => {
    const response = await apiClient.post(ENDPOINTS.CREATE, {
      type: 'info_post',
      data,
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create info post');
    }
    
    return response.data;
  }
);

const infoPostsSlice = createSlice({
  name: 'infoPosts',
  initialState,
  reducers: {
    setInfoPosts: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInfoPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInfoPost.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createInfoPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create info post';
      });
  },
});

export const { setInfoPosts } = infoPostsSlice.actions;
export default infoPostsSlice.reducer;
