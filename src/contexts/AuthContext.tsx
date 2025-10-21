import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  login as loginUser, 
  loginWithPhone as loginWithPhoneAction,
  register as registerUser,
  verifyToken as verifyTokenAction,
  logout as logoutUser,
  fetchUserData
} from '@/store/slices/userSlice';

type UserRole = 'contractor' | 'client' | 'admin';

interface User {
  id: number;
  name: string;
  role: UserRole;
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

interface UserData {
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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  loadUserData: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  name: string;
  role?: 'client' | 'contractor';
  organization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading } = useAppSelector((state) => state.user);
  
  const userData = useAppSelector((state) => {
    const data = {
      objects: state.objects.items,
      works: state.works.items,
      inspections: state.inspections.items,
      remarks: [],
      workLogs: state.workLogs.items,
      checkpoints: [],
      contractors: state.contractors.items,
      chatMessages: [],
      unreadCounts: {},
      defect_reports: state.defectReports.items,
    };
    console.log('🔄 AuthContext userData selector:', {
      objectsCount: data.objects.length,
      worksCount: data.works.length,
      workLogsCount: data.workLogs.length,
      inspectionsCount: data.inspections.length,
      defectReportsCount: data.defect_reports.length
    });
    return data;
  });

  /**
   * Загрузка данных пользователя из backend
   * Автоматически распределяет данные по Redux slices
   */
  const loadUserData = async () => {
    if (token) {
      await dispatch(fetchUserData());
    }
  };

  const setUserData = (data: UserData) => {
    console.warn('setUserData is deprecated, use Redux actions instead');
  };

  /**
   * Авторизация через email и пароль
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль
   * @throws {Error} Если авторизация не удалась
   */
  const login = async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchUserData());
    } else {
      throw new Error(result.payload as string || 'Ошибка входа');
    }
  };

  /**
   * Авторизация через номер телефона и код подтверждения
   * @param {string} phone - Номер телефона
   * @param {string} code - Код подтверждения из SMS
   * @throws {Error} Если авторизация не удалась
   */
  const loginWithPhone = async (phone: string, code: string) => {
    const result = await dispatch(loginWithPhoneAction({ phone, code }));
    if (loginWithPhoneAction.fulfilled.match(result)) {
      await dispatch(fetchUserData());
    } else {
      throw new Error(result.payload as string || 'Ошибка входа');
    }
  };

  /**
   * Регистрация нового пользователя
   * @param {RegisterData} registerData - Данные для регистрации (name, email/phone, password, role)
   * @throws {Error} Если регистрация не удалась
   */
  const register = async (registerData: RegisterData) => {
    const result = await dispatch(registerUser(registerData));
    if (registerUser.fulfilled.match(result)) {
      await dispatch(fetchUserData());
    } else {
      throw new Error(result.payload as string || 'Ошибка регистрации');
    }
  };

  /**
   * Проверка валидности токена авторизации
   * При успехе загружает данные пользователя
   * @returns {Promise<boolean>} true если токен валиден
   */
  const verifyToken = async (): Promise<boolean> => {
    const result = await dispatch(verifyTokenAction());
    if (verifyTokenAction.fulfilled.match(result)) {
      await dispatch(fetchUserData());
      return true;
    }
    return false;
  };

  /**
   * Выход из системы
   * Очищает все данные пользователя и токен
   */
  const logout = () => {
    dispatch(logoutUser());
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      userData,
      setUserData,
      loadUserData,
      login,
      loginWithPhone,
      register,
      logout, 
      verifyToken,
      isAuthenticated: !!user && !!token, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook для получения контекста авторизации
 * @throws {Error} Если используется вне AuthProvider
 * @returns {AuthContextType} Контекст авторизации с методами login, logout, register и т.д.
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};