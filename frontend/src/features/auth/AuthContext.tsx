import React, { createContext, useContext, useState, useEffect } from 'react';

export type AuthMode = 'AUTHENTICATED' | 'DEMO' | 'UNAUTHENTICATED';

interface AuthState {
  mode: AuthMode;
  user: any | null;
  onboardingComplete: boolean;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (user: any, token: string) => void;
  completeOnboarding: () => void;
  setOnboardingStatus: (status: boolean) => void;
  enableDemoMode: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('zoqel_user');
    const savedToken = localStorage.getItem('zoqel_token');
    const isDemo = localStorage.getItem('zoqel_demo') === 'true';
    const onboarding = localStorage.getItem('zoqel_onboarding') === 'true';

    if (savedToken && savedUser) {
      return { mode: 'AUTHENTICATED', user: JSON.parse(savedUser), token: savedToken, onboardingComplete: onboarding };
    }
    if (isDemo) {
      return { mode: 'DEMO', user: null, token: null, onboardingComplete: true };
    }
    return { mode: 'UNAUTHENTICATED', user: null, token: null, onboardingComplete: false };
  });

  const login = (user: any, token: string) => {
    localStorage.setItem('zoqel_user', JSON.stringify(user));
    localStorage.setItem('zoqel_token', token);
    localStorage.removeItem('zoqel_demo');
    setState({ mode: 'AUTHENTICATED', user, token, onboardingComplete: false });
  };

  const completeOnboarding = () => {
    localStorage.setItem('zoqel_onboarding', 'true');
    setState(s => ({ ...s, onboardingComplete: true }));
  };

  const setOnboardingStatus = (status: boolean) => {
    if (status) {
      localStorage.setItem('zoqel_onboarding', 'true');
    } else {
      localStorage.removeItem('zoqel_onboarding');
    }
    setState(s => ({ ...s, onboardingComplete: status }));
  };

  const enableDemoMode = () => {
    localStorage.setItem('zoqel_demo', 'true');
    localStorage.removeItem('zoqel_user');
    localStorage.removeItem('zoqel_token');
    setState({ mode: 'DEMO', user: null, token: null, onboardingComplete: true });
  };

  const logout = () => {
    localStorage.removeItem('zoqel_user');
    localStorage.removeItem('zoqel_token');
    localStorage.removeItem('zoqel_demo');
    localStorage.removeItem('zoqel_onboarding');
    setState({ mode: 'UNAUTHENTICATED', user: null, token: null, onboardingComplete: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, enableDemoMode, logout, completeOnboarding, setOnboardingStatus }}>
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
