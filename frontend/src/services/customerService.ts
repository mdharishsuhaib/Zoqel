import apiClient from './apiClient';
import type { Customer, PagedResponse } from '../types';

export async function getCustomers(page = 0, size = 50): Promise<PagedResponse<Customer>> {
  return (await apiClient.get<PagedResponse<Customer>>('/customers', { params: { page, size } })).data;
}

export async function getCustomerHistory(id: string): Promise<any> {
  return (await apiClient.get<any>('/customers/' + id + '/history')).data;
}

