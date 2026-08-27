import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { LandingPage } from '../features/landing/LandingPage';
import { AuthPage } from '../features/auth/AuthPage';
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

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/proof" element={<ProofModePage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/app" element={<Layout />}>
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
    </Routes>
    </>
  );
}
