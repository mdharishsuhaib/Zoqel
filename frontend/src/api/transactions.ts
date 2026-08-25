import client from './client';
import { PagedResponse, Transaction } from '../types';

export const fetchTransactions = async (page: number, size: number, status?: string): Promise<PagedResponse<Transaction>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (status && status !== 'all') {
    params.append('status', status);
  }
  const response = await client.get<PagedResponse<Transaction>>(`/transactions?${params.toString()}`);
  return response.data;
};

export const fetchTransaction = async (id: string): Promise<Transaction> => {
  const response = await client.get<Transaction>(`/transactions/${id}`);
  return response.data;
};

export const simulateTransaction = async (customerId: string, amountPaise: number, failureReason: string, paymentMethod: string): Promise<Transaction> => {
  const response = await client.post<Transaction>('/transactions/simulate', {
    customerId,
    amountPaise,
    failureReason,
    paymentMethod
  });
  return response.data;
};
