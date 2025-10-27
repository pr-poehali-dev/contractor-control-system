import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { RootState } from '../store';

export interface DocumentTemplate {
  id: number;
  client_id: number;
  name: string;
  description?: string;
  template_type: string;
  content: {
    blocks: TemplateBlock[];
  };
  version: number;
  is_active: boolean;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  usage_count?: number;
}

export interface TemplateBlock {
  id: string;
  type: 'header' | 'text' | 'field' | 'table' | 'image' | 'signature' | 'conditional';
  label?: string;
  value?: string;
  text?: string;
  style?: Record<string, any>;
  condition?: string;
  children?: TemplateBlock[];
  columns?: Array<{ key: string; label: string }>;
  rows?: string;
}

interface DocumentTemplatesState {
  items: DocumentTemplate[];
  currentTemplate: DocumentTemplate | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentTemplatesState = {
  items: [],
  currentTemplate: null,
  loading: false,
  error: null,
};

export const fetchTemplates = createAsyncThunk(
  'documentTemplates/fetchAll',
  async (type?: string, { rejectWithValue }) => {
    try {
      const params = type ? { type } : undefined;
      const response = await apiClient.get(ENDPOINTS.DOCUMENT_TEMPLATES.LIST, { 
        params,
        skipAuthRedirect: true 
      });
      return response.data.templates;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch templates');
    }
  }
);

export const fetchTemplateDetail = createAsyncThunk(
  'documentTemplates/fetchDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.DOCUMENT_TEMPLATES.DETAIL, {
        params: { id },
        skipAuthRedirect: true
      });
      return response.data.template;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch template detail');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'documentTemplates/create',
  async (data: {
    name: string;
    description?: string;
    template_type: string;
    content: { blocks: TemplateBlock[] };
  }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.DOCUMENT_TEMPLATES.CREATE, data, {
        skipAuthRedirect: true
      });
      return response.data.template;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create template');
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'documentTemplates/update',
  async (data: {
    id: number;
    name?: string;
    description?: string;
    content?: { blocks: TemplateBlock[] };
    is_active?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.DOCUMENT_TEMPLATES.UPDATE, data, {
        skipAuthRedirect: true
      });
      return response.data.template;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update template');
    }
  }
);

const documentTemplatesSlice = createSlice({
  name: 'documentTemplates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTemplate: (state, action: PayloadAction<DocumentTemplate | null>) => {
      state.currentTemplate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      })
      
      .addCase(fetchTemplateDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplateDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTemplate = action.payload;
      })
      .addCase(fetchTemplateDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch template';
      })
      
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.currentTemplate = action.payload;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create template';
      })
      
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = action.payload;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update template';
      });
  },
});

export const { clearError, setCurrentTemplate } = documentTemplatesSlice.actions;

export const selectTemplates = (state: RootState) => state.documentTemplates.items;
export const selectCurrentTemplate = (state: RootState) => state.documentTemplates.currentTemplate;
export const selectTemplatesLoading = (state: RootState) => state.documentTemplates.loading;
export const selectTemplatesError = (state: RootState) => state.documentTemplates.error;

export const selectTemplatesByType = (type: string) => (state: RootState) =>
  state.documentTemplates.items.filter(t => t.template_type === type && t.is_active);

export default documentTemplatesSlice.reducer;