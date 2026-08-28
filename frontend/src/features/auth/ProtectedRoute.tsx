import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { mode, onboardingComplete, completeOnboarding } = useAuth();
  const [isChecking, setIsChecking] = useState(!onboardingComplete && mode === 'AUTHENTICATED');
  const location = useLocation();

  useEffect(() => {
    if (mode === 'AUTHENTICATED' && !onboardingComplete) {
      apiClient.get('/workspaces/me')
        .then(() => {
          completeOnboarding();
        })
        .catch(() => {
          // No workspace yet
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, [mode, onboardingComplete, completeOnboarding]);

  if (mode === 'UNAUTHENTICATED') {
    return <Navigate to="/login" replace />;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#2B84EA] animate-spin" />
          <p className="text-sm text-[#475467] font-medium">Verifying workspace...</p>
        </div>
      </div>
    );
  }

  // If onboarding is incomplete and they are not on /onboarding, redirect to /onboarding
  if (!onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is complete and they are on /onboarding, redirect to /app
  if (onboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
