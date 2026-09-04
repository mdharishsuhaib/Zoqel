import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import React from 'react';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import { LandingPage } from '../features/landing/LandingPage';
import { AuthPage } from '../features/auth/AuthPage';
import { OnboardingWizard } from '../features/onboarding/OnboardingWizard';
import { OverviewPage } from '../features/overview/OverviewPage';
import { RecoveryQueuePage } from '../features/recovery/RecoveryQueuePage';
import { PaymentsPage } from '../features/payments/PaymentsPage';
import { TransactionDetailPage } from '../features/payments/TransactionDetailPage';
import { SimulatorPage } from '../features/simulator/SimulatorPage';
import { AgentPage } from '../features/agent/AgentPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { AuditPage } from '../features/audit/AuditPage';
import { HumanReviewPage } from '../features/review/HumanReviewPage';
import { CustomersPage } from '../features/customers/CustomersPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ProofModePage } from '../features/proof/ProofModePage';
import { DocsPage } from '../features/landing/DocsPage';
import { PrivacyPage } from '../features/landing/PrivacyPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function DemoRoute() {
  const { enableDemoMode, mode } = useAuth();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // GUARD: never overwrite a real authenticated session with demo mode.
    // If the user is already signed in, just send them straight to the app.
    if (mode === 'AUTHENTICATED') {
      setLoading(false);
      return;
    }
    enableDemoMode().finally(() => setLoading(false));
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101828]">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#9CA3AF]">Loading demo workspace...</p>
          <p className="text-xs text-[#6B7280] max-w-xs text-center mt-2">
            Please allow up to 60 seconds for the free-tier server to wake up from inactivity.
          </p>
        </div>
      </div>
    );
  }
  return <Navigate to="/app" replace />;
}

// Redirect logged-in users away from public auth routes
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { mode } = useAuth();
  if (mode !== 'UNAUTHENTICATED') {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}

// Silently wake the Render backend as soon as the app loads.
// Render free-tier cold-starts take ~90-160s. By pinging /api/auth/demo
// the moment any page loads, we reduce cold-start delay before a judge clicks "Try Demo".
function BackendWarmup() {
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || 'https://zoqel-8ly3.onrender.com';
    fetch(`${base}/api/auth/demo`, { method: 'POST', keepalive: true }).catch(() => {});
  }, []);
  return null;
}

export function App() {
  return (
    <AuthProvider>
      <BackendWarmup />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<PublicOnlyRoute><AuthPage mode="login" /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><AuthPage mode="signup" /></PublicOnlyRoute>} />
        <Route path="/demo" element={<DemoRoute />} />

        {/* Public Marketing/Legal */}
        <Route path="/proof" element={<ProofModePage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingWizard />} />
        </Route>
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<OverviewPage />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="recovery" element={<RecoveryQueuePage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="payments/:id" element={<TransactionDetailPage />} />
            <Route path="simulator" element={<SimulatorPage />} />
            <Route path="agent" element={<AgentPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="review" element={<HumanReviewPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

