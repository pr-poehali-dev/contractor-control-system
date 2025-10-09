import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const API_BASE = 'https://functions.poehali.dev';
const AUTH_API = `${API_BASE}/b9d6731e-788e-476b-bad5-047bd3d6adc1`;

type UserRole = 'contractor' | 'client' | 'admin';

interface User {
  id: number;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  organization?: string;
}

interface UserData {
  projects: any[];
  sites: any[];
  works: any[];
  inspections: any[];
  remarks: any[];
  workLogs: any[];
  checkpoints: any[];
  contractors: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  login: (email: string, password: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAuth = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_API}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      saveAuth(data.token, data.user);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_API}?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      saveAuth(data.token, data.user);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('auth_token');
    
    if (!storedToken) {
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${AUTH_API}?action=verify`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': storedToken,
        },
      });

      if (!response.ok) {
        clearAuth();
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setToken(storedToken);
      setIsLoading(false);
      return true;
    } catch (error) {
      clearAuth();
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    clearAuth();
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
      login, 
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