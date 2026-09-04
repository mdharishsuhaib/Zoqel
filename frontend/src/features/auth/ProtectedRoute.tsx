import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { Loader2, RefreshCw } from 'lucide-react';

export function ProtectedRoute() {
  const { mode, onboardingComplete, completeOnboarding } = useAuth();
  const [isChecking, setIsChecking] = useState(!onboardingComplete && mode === 'AUTHENTICATED');
  // null = not checked yet, true = has workspace, false = definitely no workspace
  const [hasWorkspace, setHasWorkspace] = useState<boolean | null>(onboardingComplete ? true : null);
  const [checkError, setCheckError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (mode === 'AUTHENTICATED' && !onboardingComplete) {
      setIsChecking(true);
      setCheckError(false);
      apiClient.get('/workspaces/me')
        .then(() => {
          // Workspace exists — mark onboarding complete
          completeOnboarding();
          setHasWorkspace(true);
        })
        .catch((err: any) => {
          const status = err?.response?.status;
          if (status === 404) {
            // Definitively no workspace yet — send to onboarding
            setHasWorkspace(false);
          } else {
            // Network/server error — do NOT assume no workspace; show retry
            setCheckError(true);
          }
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, [mode, onboardingComplete]);

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

  // Server/network error during workspace check — show retry instead of sending to onboarding
  if (checkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#101828] mb-1">Server is waking up</h2>
            <p className="text-sm text-[#475467]">
              The backend is starting up (free-tier cold start). This usually takes up to 60 seconds.
            </p>
          </div>
          <button
            onClick={() => {
              setCheckError(false);
              setIsChecking(true);
              apiClient.get('/workspaces/me')
                .then(() => { completeOnboarding(); setHasWorkspace(true); })
                .catch((err: any) => {
                  if (err?.response?.status === 404) { setHasWorkspace(false); }
                  else { setCheckError(true); }
                })
                .finally(() => setIsChecking(false));
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2B84EA] text-white text-sm font-semibold rounded-lg hover:bg-[#1A6DD0] transition-colors"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If onboarding is incomplete and they are not on /onboarding, redirect to /onboarding
  if (!onboardingComplete && hasWorkspace === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is complete and they are on /onboarding, redirect to /app
  if (onboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
