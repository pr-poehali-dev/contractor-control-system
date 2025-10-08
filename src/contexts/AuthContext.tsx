import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'customer' | 'contractor';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  login: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  test1: {
    password: '123456',
    user: {
      id: 'test1',
      login: 'Test1',
      name: 'Заказчик Петров',
      role: 'customer',
      email: 'test1@podryad.pro',
    },
  },
  test2: {
    password: '123456',
    user: {
      id: 'test2',
      login: 'Test2',
      name: 'Подрядчик Иванов',
      role: 'contractor',
      email: 'test2@podryad.pro',
    },
  },
  test3: {
    password: '123456',
    user: {
      id: 'test3',
      login: 'Test3',
      name: 'Заказчик Сидоров',
      role: 'customer',
      email: 'test3@podryad.pro',
    },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const loginKey = email.toLowerCase();
    const userData = MOCK_USERS[loginKey];
    
    if (userData && userData.password === password) {
      setUser(userData.user);
      localStorage.setItem('user', JSON.stringify(userData.user));
    } else {
      throw new Error('Неверный логин или пароль');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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