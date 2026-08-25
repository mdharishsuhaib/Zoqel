import client from './client';
import { PagedResponse, AuditEvent } from '../types';

export const fetchAuditTimeline = async (transactionId: string): Promise<AuditEvent[]> => {
  const response = await client.get<AuditEvent[]>(`/audit/${transactionId}`);
  return response.data;
};

export const fetchRecentAuditEvents = async (page: number, size: number): Promise<PagedResponse<AuditEvent>> => {
  const response = await client.get<PagedResponse<AuditEvent>>(`/audit?page=${page}&size=${size}`);
  return response.data;
};
