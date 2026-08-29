import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

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
  enableDemoMode: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_API_URL || 'https://zoqel-8ly3.onrender.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('zoqel_user');
    const savedToken = localStorage.getItem('zoqel_token');
    const demoToken = localStorage.getItem('zoqel_demo_token');
    const onboarding = localStorage.getItem('zoqel_onboarding') === 'true';

    if (savedToken && savedUser) {
      return { mode: 'AUTHENTICATED', user: JSON.parse(savedUser), token: savedToken, onboardingComplete: onboarding };
    }
    // Demo mode: persisted via demo token in localStorage
    if (demoToken) {
      return { mode: 'DEMO', user: { fullName: 'Demo User' }, token: demoToken, onboardingComplete: true };
    }
    return { mode: 'UNAUTHENTICATED', user: null, token: null, onboardingComplete: false };
  });

  const login = (user: any, token: string) => {
    localStorage.setItem('zoqel_user', JSON.stringify(user));
    localStorage.setItem('zoqel_token', token);
    localStorage.removeItem('zoqel_demo_token');
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

  // Demo mode: fetches a real backend token scoped to demo-workspace
  const enableDemoMode = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/demo`);
      const { token, fullName } = res.data;
      localStorage.setItem('zoqel_demo_token', token);
      localStorage.removeItem('zoqel_user');
      localStorage.removeItem('zoqel_token');
      localStorage.removeItem('zoqel_onboarding');
      setState({ mode: 'DEMO', user: { fullName: fullName || 'Demo User' }, token, onboardingComplete: true });
    } catch {
      // Fallback: offline demo mode with no token (static data only)
      localStorage.setItem('zoqel_demo_token', 'offline-demo');
      setState({ mode: 'DEMO', user: { fullName: 'Demo User' }, token: null, onboardingComplete: true });
    }
  };

  const logout = () => {
    localStorage.removeItem('zoqel_user');
    localStorage.removeItem('zoqel_token');
    localStorage.removeItem('zoqel_demo_token');
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
