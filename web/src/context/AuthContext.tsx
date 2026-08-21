import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  id?: string;
  email?: string;
  displayName?: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isHydrated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
  login: (user: User, role?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  // True once the initial localStorage check has run, so ProtectedRoute
  // doesn't redirect during the first render before auth state hydrates.
  const [isHydrated, setIsHydrated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          setUser(null);
        }
      }
      if (storedRole) setRole(storedRole);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
    }
    setIsHydrated(true);
  }, []);

  const login = (userData: User, userRole?: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (userRole) setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isHydrated, setIsAuthenticated, user, setUser, role, setRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};