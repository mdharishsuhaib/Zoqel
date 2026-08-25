import client from './client';
import { PagedResponse, Customer, CustomerHistory } from '../types';

export const fetchCustomers = async (page: number, size: number): Promise<PagedResponse<Customer>> => {
  const response = await client.get<PagedResponse<Customer>>(`/customers?page=${page}&size=${size}`);
  return response.data;
};

export const fetchCustomerHistory = async (customerId: string): Promise<CustomerHistory> => {
  const response = await client.get<CustomerHistory>(`/customers/${customerId}/history`);
  return response.data;
};
