import client from './client';
import { PagedResponse, RecoveryCase } from '../types';

export const fetchRecoveryCases = async (page: number, size: number): Promise<PagedResponse<RecoveryCase>> => {
  const response = await client.get<PagedResponse<RecoveryCase>>(`/recovery?page=${page}&size=${size}`);
  return response.data;
};

export const fetchRecoveryCase = async (id: string): Promise<RecoveryCase> => {
  const response = await client.get<RecoveryCase>(`/recovery/${id}`);
  return response.data;
};

export const fetchRecoveryCaseByTransaction = async (transactionId: string): Promise<RecoveryCase> => {
  const response = await client.get<RecoveryCase>(`/recovery/transaction/${transactionId}`);
  return response.data;
};

export const processRecovery = async (transactionId: string): Promise<RecoveryCase> => {
  const response = await client.post<RecoveryCase>(`/recovery/process/${transactionId}`);
  return response.data;
};
