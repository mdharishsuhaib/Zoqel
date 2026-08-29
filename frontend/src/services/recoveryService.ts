import apiClient from './apiClient';
import { MOCK_METRICS, MOCK_CHART_DATA } from '../data/dashboard';
import { MOCK_TRANSACTIONS, MOCK_RECOVERY_CASES } from '../data/transactions';
import type { DashboardMetrics, ChartDataPoint, Transaction, RecoveryCase, PagedResponse } from '../types';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try { return (await apiClient.get<DashboardMetrics>('/dashboard/metrics')).data; }
  catch { return MOCK_METRICS; }
}

export async function getChartData(): Promise<ChartDataPoint[]> {
  try { return (await apiClient.get<ChartDataPoint[]>('/dashboard/chart')).data; }
  catch { return MOCK_CHART_DATA; }
}

export async function getTransactions(page = 0, size = 20, status?: string): Promise<PagedResponse<Transaction>> {
  try {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    return (await apiClient.get<PagedResponse<Transaction>>('/transactions', { params })).data;
  } catch {
    const filtered = status ? MOCK_TRANSACTIONS.filter(t => t.status === status) : MOCK_TRANSACTIONS;
    return { content: filtered, totalElements: filtered.length, totalPages: 1, size, number: page };
  }
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  try { return (await apiClient.get<Transaction>(`/transactions/${id}`)).data; }
  catch { return MOCK_TRANSACTIONS.find(t => t.id === id) ?? null; }
}

export async function processRecovery(transactionId: string): Promise<RecoveryCase> {
  try { return (await apiClient.post<RecoveryCase>(`/recovery/process/${transactionId}`)).data; }
  catch { return MOCK_RECOVERY_CASES.find(r => r.transactionId === transactionId) ?? MOCK_RECOVERY_CASES[0]; }
}

export async function getRecoveryCase(transactionId: string): Promise<RecoveryCase | null> {
  try { 
    const res = await apiClient.get<RecoveryCase>(`/recovery/transaction/${transactionId}`);
    if (!res.data) {
      return { ...(MOCK_RECOVERY_CASES[0]), transactionId, id: `RC-${Math.random()}` };
    }
    return res.data;
  }
  catch { 
    return { ...(MOCK_RECOVERY_CASES[0]), transactionId, id: `RC-${Math.random()}` };
  }
}

export async function getRecoveryCases(): Promise<RecoveryCase[]> {
  try { return (await apiClient.get<PagedResponse<RecoveryCase>>('/recovery')).data.content; }
  catch { return MOCK_RECOVERY_CASES; }
}
export async function getRecentAuditEvents(): Promise<any[]> {
  try {
    return (await apiClient.get('/audit?size=5&sort=occurredAt,desc')).data.content;
  } catch {
    return [];
  }
}
