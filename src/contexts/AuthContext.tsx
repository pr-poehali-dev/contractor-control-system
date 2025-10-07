import { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'customer' | 'contractor';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: '1',
      name: role === 'customer' ? 'Инспектор Петров' : 'Иванов Сергей',
      role,
      email,
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
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
