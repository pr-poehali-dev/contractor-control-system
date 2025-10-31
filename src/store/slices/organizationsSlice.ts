import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { RootState } from '../store';

export interface OrganizationWork {
  id: number;
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  created_at: string;
  object_id: number;
  object_name: string;
  object_address?: string;
  contractor_name: string;
  contractor_id: number;
}

export interface Organization {
  id: number;
  name: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  legal_address?: string;
  actual_address?: string;
  phone?: string;
  email?: string;
  status: string;
  type?: 'client' | 'contractor';
  director_name?: string;
  director_position?: string;
  bik?: string;
  bank_name?: string;
  payment_account?: string;
  correspondent_account?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  employees_count?: number;
  works_count?: number;
  employees?: OrganizationEmployee[];
  pending_invites?: OrganizationInvite[];
  works?: OrganizationWork[];
}

export interface OrganizationEmployee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  organization_role: 'admin' | 'employee';
  created_at: string;
}

export interface OrganizationInvite {
  id: number;
  phone: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
}

interface OrganizationsState {
  items: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationsState = {
  items: [],
  currentOrganization: null,
  loading: false,
  error: null,
};

export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.ORGANIZATIONS.LIST, {
        skipAuthRedirect: true
      });
      return response.data.organizations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch organizations');
    }
  }
);

export const fetchOrganizationDetail = createAsyncThunk(
  'organizations/fetchDetail',
  async (id: number) => {
    const response = await apiClient.get(ENDPOINTS.ORGANIZATIONS.DETAIL, {
      params: { id }
    });
    return response.data.organization;
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async (data: {
    name: string;
    inn: string;
    kpp?: string;
    legal_address?: string;
    actual_address?: string;
    phone?: string;
    email?: string;
    first_user_phone?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ORGANIZATIONS.CREATE, data);
      return response.data.organization;
    } catch (error: any) {
      console.log('🔍 Create org error:', error);
      // Если это 409 (организация существует), передаём данные существующей организации
      if (error.status === 409 && error.data?.existing_organization) {
        return rejectWithValue({
          error: error.data.error,
          existing_organization: error.data.existing_organization
        });
      }
      return rejectWithValue({ error: error.message || 'Failed to create organization' });
    }
  }
);

export const linkOrganization = createAsyncThunk(
  'organizations/link',
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.ORGANIZATIONS.LINK, { organization_id: organizationId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to link organization');
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/update',
  async (data: {
    id: number;
    name?: string;
    inn?: string;
    kpp?: string;
    ogrn?: string;
    legal_address?: string;
    actual_address?: string;
    phone?: string;
    email?: string;
    director_name?: string;
    director_position?: string;
    bik?: string;
    bank_name?: string;
    payment_account?: string;
    correspondent_account?: string;
  }) => {
    const response = await apiClient.put(ENDPOINTS.ORGANIZATIONS.UPDATE, data);
    return response.data.organization;
  }
);

export const sendInvite = createAsyncThunk(
  'organizations/sendInvite',
  async (data: { organization_id: number; phone: string }) => {
    const response = await apiClient.post(ENDPOINTS.ORGANIZATION_INVITES.SEND, data);
    return response.data.invite;
  }
);

export const acceptInvite = createAsyncThunk(
  'organizations/acceptInvite',
  async (token: string) => {
    const response = await apiClient.put(ENDPOINTS.ORGANIZATION_INVITES.ACCEPT, { token });
    return response.data;
  }
);

export const checkInvite = createAsyncThunk(
  'organizations/checkInvite',
  async (token: string) => {
    const response = await apiClient.get(ENDPOINTS.ORGANIZATION_INVITES.CHECK, {
      params: { token }
    });
    return response.data.invite;
  }
);

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrganization: (state, action: PayloadAction<Organization | null>) => {
      state.currentOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch organizations';
      })
      
      .addCase(fetchOrganizationDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(fetchOrganizationDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch organization';
      })
      
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.currentOrganization = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create organization';
      })
      
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(org => org.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentOrganization?.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update organization';
      })
      
      .addCase(linkOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(linkOrganization.fulfilled, (state, action) => {
        state.loading = false;
        // Организация уже добавлена на бэкенде, просто обновляем список
      })
      .addCase(linkOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to link organization';
      });
  },
});

export const { clearError, setCurrentOrganization } = organizationsSlice.actions;

export const selectOrganizations = (state: RootState) => state.organizations.items;
export const selectCurrentOrganization = (state: RootState) => state.organizations.currentOrganization;
export const selectOrganizationsLoading = (state: RootState) => state.organizations.loading;
export const selectOrganizationsError = (state: RootState) => state.organizations.error;

export default organizationsSlice.reducer;