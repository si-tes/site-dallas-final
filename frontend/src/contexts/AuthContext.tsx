import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      const storedToken = localStorage.getItem('@DallasImports:token');
      
      if (storedToken) {
        try {
          const { user } = await authService.me(storedToken);
          setToken(storedToken);
          setUser(user);
        } catch (error) {
          console.error('Sessão expirada ou token inválido', error);
          localStorage.removeItem('@DallasImports:token');
        }
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('@DallasImports:token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('@DallasImports:token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
