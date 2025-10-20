import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  loginUser, 
  loginWithPhone as loginWithPhoneAction,
  registerUser,
  verifyToken as verifyTokenAction,
  logoutUser,
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
  
  const userData = useAppSelector((state) => ({
    objects: state.objects.items,
    works: state.works.items,
    inspections: state.inspections.items,
    remarks: [], // TODO: add remarks slice if needed
    workLogs: state.workLogs.items,
    checkpoints: [], // TODO: add checkpoints slice if needed
    contractors: state.contractors.items,
    chatMessages: [], // TODO: add chat slice if needed
    unreadCounts: {}, // TODO: add unread counts to slices
    defect_reports: [], // TODO: add defect reports slice if needed
  }));

  const loadUserData = async () => {
    if (token) {
      await dispatch(fetchUserData());
    }
  };

  const setUserData = (data: UserData) => {
    console.warn('setUserData is deprecated, use Redux actions instead');
  };

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchUserData());
    } else {
      throw new Error(result.payload as string || 'Ошибка входа');
    }
  };

  const loginWithPhone = async (phone: string, code: string) => {
    const result = await dispatch(loginWithPhoneAction({ phone, code }));
    if (loginWithPhoneAction.fulfilled.match(result)) {
      await dispatch(fetchUserData());
    } else {
      throw new Error(result.payload as string || 'Ошибка входа');
    }
  };

  const register = async (registerData: RegisterData) => {
    const result = await dispatch(registerUser(registerData));
    if (registerUser.fulfilled.match(result)) {
      await dispatch(fetchUserData());
    } else {
      throw new Error(result.payload as string || 'Ошибка регистрации');
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    const result = await dispatch(verifyTokenAction());
    if (verifyTokenAction.fulfilled.match(result)) {
      await dispatch(fetchUserData());
      return true;
    }
    return false;
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};