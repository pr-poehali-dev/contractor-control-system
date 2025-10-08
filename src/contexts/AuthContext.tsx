import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api, type User as APIUser, type UserData } from '@/lib/api';

type UserRole = 'contractor' | 'client';

interface User {
  id: number;
  name: string;
  role: UserRole;
  email?: string;
  phone: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const PHONE_MAP: Record<string, string> = {
  'test1': '+79991234501',
  'test2': '+79991234502',
  'test3': '+79991234503',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (input: string) => {
    setIsLoading(true);
    
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    setUser(null);
    setUserData(null);
    
    try {
      const phone = PHONE_MAP[input.toLowerCase()] || input;
      
      const apiUser: APIUser = await api.login(phone);
      
      const mappedUser: User = {
        id: apiUser.id,
        name: apiUser.name,
        role: apiUser.role === 'contractor' ? 'contractor' : 'client',
        email: apiUser.email,
        phone: apiUser.phone,
        organization: apiUser.organization,
      };
      
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      
      const data = await api.getUserData(apiUser.id);
      setUserData(data);
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Неверный логин');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
  };

  const refreshUserData = () => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedData = localStorage.getItem('userData');
    
    if (storedUser && storedData) {
      setUser(JSON.parse(storedUser));
      setUserData(JSON.parse(storedData));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, setUserData, login, logout, refreshUserData, isAuthenticated: !!user, isLoading }}>
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