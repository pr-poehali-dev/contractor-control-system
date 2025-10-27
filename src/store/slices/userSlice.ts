import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export interface User {
  id: number;
  name: string;
  role: 'contractor' | 'client' | 'admin';
  email?: string;
  phone?: string;
  organization?: string;
  created_at?: string;
}

export interface Work {
  id: number;
  object_id: number;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'delayed';
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

export interface UserData {
  objects: any[];
  works: Work[];
  inspections: any[];
  remarks: any[];
  workLogs: any[];
  checkpoints: any[];
  contractors: any[];
  chatMessages?: any[];
  unreadCounts?: Record<number, { logs?: number; messages?: number; inspections?: number }>;
  defect_reports?: any[];
  user?: User;
}

interface UserState {
  user: User | null;
  token: string | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to parse user from localStorage:', errorMessage);
      return null;
    }
  })(),
  token: localStorage.getItem('auth_token'),
  userData: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
};

/**
 * Авторизация пользователя через email и пароль
 * @param {Object} credentials - Учетные данные
 * @param {string} credentials.email - Email пользователя
 * @param {string} credentials.password - Пароль
 * @returns {Promise<{token: string, user: User}>} Токен и данные пользователя
 */
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response.data as any;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Авторизация пользователя через телефон и код подтверждения
 * @param {Object} credentials - Учетные данные
 * @param {string} credentials.phone - Номер телефона
 * @param {string} credentials.code - Код подтверждения
 * @returns {Promise<{token: string, user: User}>} Токен и данные пользователя
 */
export const loginWithPhone = createAsyncThunk(
  'user/loginWithPhone',
  async ({ phone, code }: { phone: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_CODE, { phone, code });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response.data as any;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login with phone error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Регистрация нового пользователя
 * @param {Object} data - Данные для регистрации
 * @param {string} [data.email] - Email (опционально)
 * @param {string} [data.phone] - Телефон (опционально)
 * @param {string} data.password - Пароль
 * @param {string} data.name - Имя пользователя
 * @param {string} [data.role] - Роль пользователя (client или contractor)
 * @param {string} [data.organization] - Название организации
 * @returns {Promise<{token: string, user: User}>} Токен и данные пользователя
 */
export const register = createAsyncThunk(
  'user/register',
  async (data: {
    email?: string;
    phone?: string;
    password: string;
    name: string;
    role?: 'client' | 'contractor';
    organization?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }

      const { token, user } = response.data as any;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('Registration error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Загрузка данных пользователя (объекты, работы, проверки и т.д.)
 * Автоматически распределяет данные по соответствующим slices
 * @returns {Promise<UserData>} Данные пользователя
 */
export const loadUserData = createAsyncThunk(
  'user/loadUserData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Передаём skipAuthRedirect для loadUserData тоже
      const response = await apiClient.get(ENDPOINTS.USER.DATA, {
        skipAuthRedirect: true
      } as any);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load user data');
      }

      const data = response.data as UserData;
      
      try {
        const { setObjects } = await import('./objectsSlice');
        const { setWorks } = await import('./worksSlice');
        const { setWorkLogs } = await import('./workLogsSlice');
        const { setInspections } = await import('./inspectionsSlice');
        const { setContractors } = await import('./contractorsSlice');
        const { setDefectReports } = await import('./defectReportsSlice');
        const { setChatMessages } = await import('./chatMessagesSlice');
        
        // Извлекаем все работы из объектов
        const allWorks = (data.objects || []).flatMap((obj: any) => obj.works || []);
        
        // Извлекаем workLogs, inspections, chatMessages из работ
        const allWorkLogs = allWorks.flatMap((work: any) => work.workLogs || []);
        const allInspections = allWorks.flatMap((work: any) => work.inspections || []);
        const allChatMessages = allWorks.flatMap((work: any) => work.chatMessages || []);
        const allDefectReports = allWorks.flatMap((work: any) => work.defectReports || []);
        
        dispatch(setObjects(data.objects || []));
        dispatch(setWorks(allWorks));
        dispatch(setWorkLogs(allWorkLogs));
        dispatch(setInspections(allInspections));
        dispatch(setContractors(data.contractors || []));
        dispatch(setDefectReports(allDefectReports));
        dispatch(setChatMessages(allChatMessages));
      } catch (importError) {
        const errorMessage = importError instanceof Error ? importError.message : String(importError);
        console.error('Failed to import slices:', errorMessage);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user data';
      console.error('Load user data error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Обновление данных профиля пользователя
 * @param {Object} data - Данные для обновления
 * @param {string} [data.name] - Новое имя
 * @param {string} [data.email] - Новый email
 * @param {string} [data.phone] - Новый телефон
 * @returns {Promise<User>} Обновленные данные пользователя
 */
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: { name?: string; email?: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.ENTITIES.UPDATE, {
        type: 'user',
        id: 1, // ID не используется, обновляем текущего пользователя
        data
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update profile');
      }

      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('Update profile error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Проверка валидности токена авторизации
 * При неудаче автоматически очищает localStorage
 * @returns {Promise<boolean>} true если токен валиден
 */
export const verifyToken = createAsyncThunk(
  'user/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('❌ verifyToken: No token in localStorage');
        throw new Error('No token found');
      }

      console.log('🔍 verifyToken: Checking token...');
      
      // Передаём skipAuthRedirect чтобы избежать автоматического редиректа
      const response = await apiClient.get(ENDPOINTS.USER.DATA, {
        skipAuthRedirect: true
      } as any);
      
      console.log('📥 verifyToken response:', response);
      
      if (!response.success) {
        console.error('❌ verifyToken: Token invalid, response:', response);
        // Если токен невалиден, удаляем его
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        throw new Error(response.error || 'Token invalid');
      }

      console.log('✅ verifyToken: Token valid');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      const status = (error as any)?.response?.status;
      
      console.error('❌ Token verification error:', {
        message: errorMessage,
        status: status
      });
      
      // Удаляем токен только при 401/403 (невалидный токен)
      if (status === 401 || status === 403) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Выход пользователя из системы
     * Очищает состояние и localStorage
     */
    logout(state) {
      state.user = null;
      state.token = null;
      state.userData = null;
      state.isAuthenticated = false;
      state.error = null;
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },
    
    /**
     * Установка данных пользователя вручную
     * @param {UserData} payload - Данные пользователя
     */
    setUserData(state, action: PayloadAction<UserData>) {
      state.userData = action.payload;
    },
    
    /**
     * Очистка ошибки
     */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Login with phone
      .addCase(loginWithPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Load user data
      .addCase(loadUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload;
        // Update user data from response if available
        if (action.payload && (action.payload as any).user) {
          state.user = (action.payload as any).user;
          localStorage.setItem('user', JSON.stringify((action.payload as any).user));
        }
        state.error = null;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        // Проверяем, есть ли токен в localStorage
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          // Если токен и user есть, восстанавливаем состояние авторизации
          try {
            state.token = token;
            state.user = JSON.parse(userStr);
            state.isAuthenticated = true;
          } catch (error) {
            // Если не удалось распарсить user, сбрасываем состояние
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
          }
        } else {
          // Если токена нет, сбрасываем состояние
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      });
  },
});

export const { logout, setUserData, clearError } = userSlice.actions;

// Экспорт для обратной совместимости с AuthContext
export const loginUser = login;
export const registerUser = register;
export const fetchUserData = loadUserData;

export default userSlice.reducer;