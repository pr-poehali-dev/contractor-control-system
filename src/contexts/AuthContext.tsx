import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const API_BASE = 'https://functions.poehali.dev';
const AUTH_API = `${API_BASE}/b9d6731e-788e-476b-bad5-047bd3d6adc1`;
const USER_DATA_API = `${API_BASE}/bdee636b-a6c0-42d0-8f77-23c316751e34`;

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
  loadUserData: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    console.log('AuthProvider init: storedUser =', storedUser ? 'EXISTS' : 'NULL');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('auth_token');
    console.log('AuthProvider init: storedToken =', storedToken ? storedToken.substring(0, 20) + '...' : 'NULL');
    return storedToken;
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAuth = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  const loadUserDataInternal = async (authToken: string) => {
    try {
      console.log('Loading user data...');
      const response = await fetch(USER_DATA_API, {
        method: 'GET',
        headers: {
          'X-Auth-Token': authToken,
        },
      });

      if (!response.ok) {
        console.error('Failed to load user data:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return;
      }

      const data = await response.json();
      console.log('User data loaded:', data);
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserData = async () => {
    if (!token) {
      console.error('Cannot load user data: no token');
      return;
    }
    await loadUserDataInternal(token);
  };

  const clearAuth = () => {
    console.log('CLEARING AUTH - called from:', new Error().stack);
    setToken(null);
    setUser(null);
    setUserData(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Login attempt:', email);
      const response = await fetch(`${AUTH_API}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, hasToken: !!data.token, hasUser: !!data.user });

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      console.log('Saving auth, token:', data.token?.substring(0, 20) + '...');
      saveAuth(data.token, data.user);
      console.log('Token saved to localStorage:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');
      await loadUserDataInternal(data.token);
    } catch (error) {
      console.error('Login error:', error);
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
      await loadUserDataInternal(data.token);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('auth_token');
    console.log('Verifying token...', storedToken ? 'Token exists' : 'No token');
    
    if (!storedToken) {
      clearAuth();
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
        console.log('Token verification failed:', response.status);
        clearAuth();
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      console.log('Token verified, user:', data.user);
      setUser(data.user);
      setToken(storedToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      await loadUserDataInternal(storedToken);
      setIsLoading(false);
      console.log('Auth flow complete');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
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
      loadUserData,
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