import React, { createContext, useContext, useState, useEffect } from 'react';

export type AuthMode = 'AUTHENTICATED' | 'DEMO' | 'UNAUTHENTICATED';

interface AuthState {
  mode: AuthMode;
  user: any | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (user: any, token: string) => void;
  enableDemoMode: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('zoqel_user');
    const savedToken = localStorage.getItem('zoqel_token');
    const isDemo = localStorage.getItem('zoqel_demo') === 'true';

    if (savedToken && savedUser) {
      return { mode: 'AUTHENTICATED', user: JSON.parse(savedUser), token: savedToken };
    }
    if (isDemo) {
      return { mode: 'DEMO', user: null, token: null };
    }
    return { mode: 'UNAUTHENTICATED', user: null, token: null };
  });

  const login = (user: any, token: string) => {
    localStorage.setItem('zoqel_user', JSON.stringify(user));
    localStorage.setItem('zoqel_token', token);
    localStorage.removeItem('zoqel_demo');
    setState({ mode: 'AUTHENTICATED', user, token });
  };

  const enableDemoMode = () => {
    localStorage.setItem('zoqel_demo', 'true');
    localStorage.removeItem('zoqel_user');
    localStorage.removeItem('zoqel_token');
    setState({ mode: 'DEMO', user: null, token: null });
  };

  const logout = () => {
    localStorage.removeItem('zoqel_user');
    localStorage.removeItem('zoqel_token');
    localStorage.removeItem('zoqel_demo');
    setState({ mode: 'UNAUTHENTICATED', user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, enableDemoMode, logout }}>
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
