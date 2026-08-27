import type { DashboardMetrics, ChartDataPoint } from '../types';

export const MOCK_METRICS: DashboardMetrics = {
  totalTransactionsAnalyzed: 10000,
  failedTransactions: 1500,
  revenueAtRiskPaise: 1124000000, // 112.4L at risk to match Landing Page mockup
  recoverableRevenuePaise: 146399000, // 14.6L recoverable
  revenueRecoveredPaise: 124000000, // 12.4L recovered this month to match Auth Page
  recoveryRate: 84.7, // Matches landing page
  recoveryCandidates: 613,
  interventionsExecuted: 755,
  successfulRecoveries: 43, // 43 recent recoveries to match Auth Page
  humanEscalations: 74,
  blockedActions: 19,
  ignoredCases: 116,
};

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: 'Aug 1', atRisk: 4200000, recoverable: 2600000, recovered: 2080000 },
  { date: 'Aug 3', atRisk: 3800000, recoverable: 2300000, recovered: 1840000 },
  { date: 'Aug 5', atRisk: 5100000, recoverable: 3200000, recovered: 2560000 },
  { date: 'Aug 7', atRisk: 4600000, recoverable: 2900000, recovered: 2320000 },
  { date: 'Aug 9', atRisk: 4900000, recoverable: 3100000, recovered: 2480000 },
  { date: 'Aug 11', atRisk: 5300000, recoverable: 3400000, recovered: 2720000 },
  { date: 'Aug 13', atRisk: 4700000, recoverable: 2800000, recovered: 2240000 },
  { date: 'Aug 15', atRisk: 5600000, recoverable: 3500000, recovered: 2800000 },
  { date: 'Aug 17', atRisk: 5200000, recoverable: 3200000, recovered: 2560000 },
  { date: 'Aug 19', atRisk: 4800000, recoverable: 3000000, recovered: 2400000 },
  { date: 'Aug 21', atRisk: 5400000, recoverable: 3400000, recovered: 2720000 },
  { date: 'Aug 23', atRisk: 5100000, recoverable: 3200000, recovered: 2560000 },
  { date: 'Aug 25', atRisk: 5700000, recoverable: 3600000, recovered: 2880000 },
  { date: 'Aug 26', atRisk: 2410000, recoverable: 1640000, recovered: 942000 },
];

export const MOCK_FAILURE_REASONS = [
  { reason: 'Bank Timeout', count: 2800, recoveryRate: 80 },
  { reason: 'Network Error', count: 2200, recoveryRate: 75 },
  { reason: 'Insufficient Funds', count: 2000, recoveryRate: 5 },
  { reason: 'Expired Card', count: 1300, recoveryRate: 10 },
  { reason: 'Repeated Failure', count: 1000, recoveryRate: 15 },
  { reason: 'Unknown', count: 400, recoveryRate: 30 },
  { reason: 'Duplicate Attempt', count: 300, recoveryRate: 0 },
];
