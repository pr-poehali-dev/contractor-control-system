import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  login as loginAction,
  loginWithPhone as loginWithPhoneAction,
  register as registerAction,
  logout as logoutAction,
  loadUserData as loadUserDataAction,
  verifyToken as verifyTokenAction,
  setUserData as setUserDataAction,
  User,
  UserData,
} from '@/store/slices/userSlice';
import { 
  setObjects 
} from '@/store/slices/objectsSlice';
import {
  setWorks
} from '@/store/slices/worksSlice';
import {
  setWorkLogs
} from '@/store/slices/workLogsSlice';
import {
  setInspections
} from '@/store/slices/inspectionsSlice';
import {
  setContractors
} from '@/store/slices/contractorsSlice';

type UserRole = 'contractor' | 'client' | 'admin';

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
  const { user, token, userData, isAuthenticated, isLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (token && !userData) {
      dispatch(loadUserDataAction());
    }
  }, [token, userData, dispatch]);

  useEffect(() => {
    if (userData) {
      if (userData.objects) dispatch(setObjects(userData.objects));
      if (userData.works) dispatch(setWorks(userData.works));
      if (userData.workLogs) dispatch(setWorkLogs(userData.workLogs));
      if (userData.inspections) dispatch(setInspections(userData.inspections));
      if (userData.contractors) dispatch(setContractors(userData.contractors));
    }
  }, [userData, dispatch]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginAction({ email, password }));
    if (loginAction.rejected.match(result)) {
      throw new Error(result.payload as string || 'Login failed');
    }
    await dispatch(loadUserDataAction());
  };

  const loginWithPhone = async (phone: string, code: string) => {
    const result = await dispatch(loginWithPhoneAction({ phone, code }));
    if (loginWithPhoneAction.rejected.match(result)) {
      throw new Error(result.payload as string || 'Login failed');
    }
    await dispatch(loadUserDataAction());
  };

  const register = async (data: RegisterData) => {
    const result = await dispatch(registerAction(data));
    if (registerAction.rejected.match(result)) {
      throw new Error(result.payload as string || 'Registration failed');
    }
    await dispatch(loadUserDataAction());
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const loadUserData = async () => {
    await dispatch(loadUserDataAction());
  };

  const setUserData = (data: UserData) => {
    dispatch(setUserDataAction(data));
  };

  const verifyToken = async (): Promise<boolean> => {
    const result = await dispatch(verifyTokenAction());
    return verifyTokenAction.fulfilled.match(result);
  };

  const value: AuthContextType = {
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
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
