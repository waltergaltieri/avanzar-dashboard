import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciales simuladas
const MOCK_CREDENTIALS = {
  email: 'admin@avanzar.com',
  password: 'admin123',
  user: {
    id: '1',
    email: 'admin@avanzar.com',
    name: 'Administrador'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar con datos del localStorage si existen
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('avanzar_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      setUser(MOCK_CREDENTIALS.user);
      // Guardar en localStorage para persistencia
      localStorage.setItem('avanzar_user', JSON.stringify(MOCK_CREDENTIALS.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('avanzar_user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}