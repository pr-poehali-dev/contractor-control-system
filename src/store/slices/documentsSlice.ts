import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { RootState } from '../store';

export interface Document {
  id: number;
  work_id: number;
  template_id?: number;
  document_number: string;
  document_type: string;
  title: string;
  content: Record<string, any>;
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  created_by: number;
  created_at: string;
  updated_at: string;
  work_title?: string;
  object_title?: string;
  created_by_name?: string;
  contractor_organization?: string;
  signatures?: DocumentSignature[];
  versions?: DocumentVersion[];
  pending_signatures?: number;
  signed_count?: number;
}

export interface DocumentSignature {
  id: number;
  document_id: number;
  signer_id: number;
  organization_id?: number;
  signature_type: 'sms' | 'ecp';
  signature_data?: string;
  status: 'pending' | 'signed' | 'rejected';
  signed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  signer_name?: string;
  signer_email?: string;
  organization_name?: string;
}

export interface DocumentVersion {
  id: number;
  document_id: number;
  version: number;
  content: Record<string, any>;
  changed_by: number;
  change_description?: string;
  created_at: string;
  changed_by_name?: string;
}

interface DocumentsState {
  items: Document[];
  currentDocument: Document | null;
  pendingSignatures: DocumentSignature[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  items: [],
  currentDocument: null,
  pendingSignatures: [],
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (params?: { work_id?: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.DOCUMENTS.LIST, { 
        params,
        skipAuthRedirect: true 
      });
      return response.data.documents;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch documents');
    }
  }
);

export const fetchDocumentDetail = createAsyncThunk(
  'documents/fetchDetail',
  async (id: number) => {
    const response = await apiClient.get(ENDPOINTS.DOCUMENTS.DETAIL, {
      params: { id }
    });
    return response.data.document;
  }
);

export const createDocument = createAsyncThunk(
  'documents/create',
  async (data: {
    work_id: number;
    template_id?: number;
    document_type: string;
    title: string;
    content: Record<string, any>;
  }) => {
    const response = await apiClient.post(ENDPOINTS.DOCUMENTS.CREATE, data);
    return response.data.document;
  }
);

export const updateDocumentStatus = createAsyncThunk(
  'documents/updateStatus',
  async (data: { id: number; status: string }) => {
    const response = await apiClient.put(ENDPOINTS.DOCUMENTS.UPDATE, data);
    return response.data.document;
  }
);

export const createSignatureRequest = createAsyncThunk(
  'documents/createSignatureRequest',
  async (data: {
    document_id: number;
    signer_id: number;
    signature_type: 'sms' | 'ecp';
  }) => {
    const response = await apiClient.post(ENDPOINTS.DOCUMENT_SIGNATURES.CREATE, data);
    return response.data.signature;
  }
);

export const signDocument = createAsyncThunk(
  'documents/sign',
  async (data: {
    signature_id: number;
    action: 'sign' | 'reject';
    signature_data?: string;
    rejection_reason?: string;
  }) => {
    const response = await apiClient.put(ENDPOINTS.DOCUMENT_SIGNATURES.SIGN, data);
    return response.data.signature;
  }
);

export const fetchPendingSignatures = createAsyncThunk(
  'documents/fetchPendingSignatures',
  async () => {
    const response = await apiClient.get(ENDPOINTS.DOCUMENT_SIGNATURES.PENDING);
    return response.data.pending_signatures;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      
      .addCase(fetchDocumentDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocumentDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch document';
      })
      
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.currentDocument = action.payload;
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create document';
      })
      
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = { ...state.currentDocument, ...action.payload };
        }
      })
      
      .addCase(fetchPendingSignatures.fulfilled, (state, action) => {
        state.pendingSignatures = action.payload;
      });
  },
});

export const { clearError, setCurrentDocument } = documentsSlice.actions;

export const selectDocuments = (state: RootState) => state.documents.items;
export const selectCurrentDocument = (state: RootState) => state.documents.currentDocument;
export const selectDocumentsLoading = (state: RootState) => state.documents.loading;
export const selectDocumentsError = (state: RootState) => state.documents.error;
export const selectPendingSignatures = (state: RootState) => state.documents.pendingSignatures;

export const selectDocumentsByWork = (workId: number) => (state: RootState) =>
  state.documents.items.filter(doc => doc.work_id === workId);

export const selectDocumentsByStatus = (status: string) => (state: RootState) =>
  state.documents.items.filter(doc => doc.status === status);

export default documentsSlice.reducer;