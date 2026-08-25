import client from './client';
import { RiskScore } from '../types';

export const fetchRiskScore = async (transactionId: string): Promise<RiskScore> => {
  const response = await client.get<RiskScore>(`/risk/${transactionId}`);
  return response.data;
};
