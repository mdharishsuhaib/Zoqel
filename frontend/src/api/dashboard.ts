import client from './client';
import { DashboardMetrics } from '../types';

export const fetchMetrics = async (): Promise<DashboardMetrics> => {
  const response = await client.get<DashboardMetrics>('/dashboard/metrics');
  return response.data;
};
