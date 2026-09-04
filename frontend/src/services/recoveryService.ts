import apiClient from './apiClient';
import { MOCK_METRICS, MOCK_CHART_DATA } from '../data/dashboard';
import { MOCK_TRANSACTIONS, MOCK_RECOVERY_CASES } from '../data/transactions';
import type { DashboardMetrics, ChartDataPoint, Transaction, RecoveryCase, PagedResponse } from '../types';

// Helper: returns true when the user is in explicit demo/offline mode.
// Only in this case do we fall back to static mock data.
function isDemoOffline(): boolean {
  return localStorage.getItem('zoqel_demo_token') === 'offline-demo';
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (isDemoOffline()) return MOCK_METRICS;
  // Let errors propagate — react-query will retry and show an error state
  return (await apiClient.get<DashboardMetrics>('/dashboard/metrics')).data;
}

export async function getChartData(): Promise<ChartDataPoint[]> {
  if (isDemoOffline()) return MOCK_CHART_DATA;
  return (await apiClient.get<ChartDataPoint[]>('/dashboard/chart')).data;
}

export async function getTransactions(page = 0, size = 20, status?: string): Promise<PagedResponse<Transaction>> {
  if (isDemoOffline()) {
    const filtered = status ? MOCK_TRANSACTIONS.filter(t => t.status === status) : MOCK_TRANSACTIONS;
    return { content: filtered, totalElements: filtered.length, totalPages: 1, size, number: page };
  }
  const params: Record<string, unknown> = { page, size };
  if (status) params.status = status;
  return (await apiClient.get<PagedResponse<Transaction>>('/transactions', { params })).data;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  if (isDemoOffline()) return MOCK_TRANSACTIONS.find(t => t.id === id) ?? null;
  return (await apiClient.get<Transaction>(`/transactions/${id}`)).data;
}

export async function processRecovery(transactionId: string): Promise<RecoveryCase> {
  return (await apiClient.post<RecoveryCase>(`/recovery/process/${transactionId}`)).data;
}

export async function getRecoveryCase(transactionId: string): Promise<RecoveryCase | null> {
  if (isDemoOffline()) {
    return { ...(MOCK_RECOVERY_CASES[0]), transactionId, id: `RC-${Math.random()}` };
  }
  const res = await apiClient.get<RecoveryCase>(`/recovery/transaction/${transactionId}`);
  return res.data ?? null;
}

export async function getRecoveryCases(): Promise<RecoveryCase[]> {
  if (isDemoOffline()) return MOCK_RECOVERY_CASES;
  return (await apiClient.get<PagedResponse<RecoveryCase>>('/recovery')).data.content;
}

export async function getRecentAuditEvents(): Promise<any[]> {
  try {
    return (await apiClient.get('/audit?size=5&sort=occurredAt,desc')).data.content;
  } catch {
    return [];
  }
}
