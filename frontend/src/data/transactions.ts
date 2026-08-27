import type { Transaction, RecoveryCase, RiskScore } from '../types';

const CUSTOMER_RAHUL = {
  id: 'CUST-00042',
  name: 'Rahul Kumar',
  email: 'rahul.kumar@email.com',
  phone: '+91 98765 43210',
  riskTier: 'LOW' as const,
  joinedAt: '2022-03-15T00:00:00Z',
  lifetimeValuePaise: 3850000,
};

const CUSTOMER_AISHA = {
  id: 'CUST-00089',
  name: 'Aisha Rahman',
  email: 'aisha.r@email.com',
  phone: '+91 87654 32109',
  riskTier: 'HIGH' as const,
  joinedAt: '2023-01-10T00:00:00Z',
  lifetimeValuePaise: 2750000,
};

const CUSTOMER_PRIYA = {
  id: 'CUST-00103',
  name: 'Priya Sharma',
  email: 'priya.s@email.com',
  riskTier: 'LOW' as const,
  joinedAt: '2022-06-20T00:00:00Z',
  lifetimeValuePaise: 1200000,
};

const CUSTOMER_ARJUN = {
  id: 'CUST-00217',
  name: 'Arjun Mehta',
  email: 'arjun.m@email.com',
  riskTier: 'MEDIUM' as const,
  joinedAt: '2023-05-01T00:00:00Z',
  lifetimeValuePaise: 550000,
};

const CUSTOMER_SNEHA = {
  id: 'CUST-00341',
  name: 'Sneha Patel',
  email: 'sneha.p@email.com',
  riskTier: 'LOW' as const,
  joinedAt: '2021-11-15T00:00:00Z',
  lifetimeValuePaise: 4800000,
};

// PRIMARY DEMO — successful recovery
export const TXN_91823: Transaction = {
  id: 'TXN-91823',
  customer: CUSTOMER_RAHUL,
  amountPaise: 499900,
  status: 'RECOVERED',
  failureReason: 'BANK_TIMEOUT',
  paymentMethod: 'UPI',
  simulatorSeed: 42819,
  initiatedAt: '2026-08-26T18:42:11Z',
  settledAt: '2026-08-26T18:42:15Z',
  createdAt: '2026-08-26T18:42:11Z',
};

// SECONDARY DEMO — blocked/escalated
export const TXN_82193: Transaction = {
  id: 'TXN-82193',
  customer: CUSTOMER_AISHA,
  amountPaise: 2750000,
  status: 'ESCALATED',
  failureReason: 'REPEATED_FAILURE',
  paymentMethod: 'NETBANKING',
  simulatorSeed: 83021,
  initiatedAt: '2026-08-26T17:18:44Z',
  createdAt: '2026-08-26T17:18:44Z',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  TXN_91823,
  TXN_82193,
  { id: 'TXN-91824', customer: CUSTOMER_PRIYA, amountPaise: 849900, status: 'RECOVERED', failureReason: 'NETWORK_ERROR', paymentMethod: 'UPI', simulatorSeed: 55221, initiatedAt: '2026-08-26T18:30:00Z', settledAt: '2026-08-26T18:30:05Z', createdAt: '2026-08-26T18:30:00Z' },
  { id: 'TXN-91825', customer: CUSTOMER_ARJUN, amountPaise: 210000, status: 'IGNORED', failureReason: 'INSUFFICIENT_FUNDS', paymentMethod: 'CARD', simulatorSeed: 91034, initiatedAt: '2026-08-26T17:55:00Z', createdAt: '2026-08-26T17:55:00Z' },
  { id: 'TXN-91826', customer: CUSTOMER_SNEHA, amountPaise: 999900, status: 'FAILED', failureReason: 'BANK_TIMEOUT', paymentMethod: 'UPI', simulatorSeed: 22847, initiatedAt: '2026-08-26T18:45:00Z', createdAt: '2026-08-26T18:45:00Z' },
  { id: 'TXN-91827', customer: CUSTOMER_RAHUL, amountPaise: 1250000, status: 'FAILED', failureReason: 'CHECKOUT_ABANDONED', paymentMethod: 'UPI', simulatorSeed: 77291, initiatedAt: '2026-08-26T19:15:00Z', createdAt: '2026-08-26T19:15:00Z' },
  { id: 'TXN-91828', customer: CUSTOMER_AISHA, amountPaise: 4500000, status: 'ESCALATED', failureReason: 'OVERDUE_RECEIVABLE', paymentMethod: 'NETBANKING', simulatorSeed: 19827, initiatedAt: '2026-08-25T10:00:00Z', createdAt: '2026-08-25T10:00:00Z' },
  { id: 'TXN-91829', customer: CUSTOMER_PRIYA, amountPaise: 149900, status: 'FAILED', failureReason: 'SUBSCRIPTION_FAILED', paymentMethod: 'CARD', simulatorSeed: 33412, initiatedAt: '2026-08-26T20:00:00Z', createdAt: '2026-08-26T20:00:00Z' },
];

export const MOCK_RECOVERY_CASES: RecoveryCase[] = [
  { id: 'RC-0001', transactionId: 'TXN-91823', status: 'RECOVERED', retryCount: 1, agentDecision: 'RETRY', agentReason: 'Temporary bank timeout with strong payment history — high probability retry candidate', agentConfidence: 0.87, policyDecision: 'ALLOWED', policyReason: 'All 4 policy checks passed', recoveryProbability: 0.87, lastAction: 'RETRY', lastActionAt: '2026-08-26T18:42:13Z', openedAt: '2026-08-26T18:42:11Z', closedAt: '2026-08-26T18:42:15Z' },
  { id: 'RC-0002', transactionId: 'TXN-82193', status: 'ESCALATED', retryCount: 0, agentDecision: 'ESCALATE', agentReason: 'Repeated failure pattern with low recovery probability and high transaction value', agentConfidence: 0.42, policyDecision: 'BLOCKED', policyReason: 'Amount INR 27,500 exceeds INR 10,000 automatic recovery threshold. 3 previous failures require human review.', recoveryProbability: 0.42, lastAction: 'ESCALATE', lastActionAt: '2026-08-26T17:18:48Z', openedAt: '2026-08-26T17:18:44Z', closedAt: '2026-08-26T17:18:50Z' },
  { id: 'RC-0003', transactionId: 'TXN-91824', status: 'RECOVERED', retryCount: 1, agentDecision: 'RETRY', agentReason: 'Network error — transient, high probability retry', agentConfidence: 0.81, policyDecision: 'ALLOWED', policyReason: 'All checks passed', recoveryProbability: 0.81, lastAction: 'RETRY', lastActionAt: '2026-08-26T18:30:02Z', openedAt: '2026-08-26T18:30:00Z', closedAt: '2026-08-26T18:30:05Z' },
  { id: 'RC-0004', transactionId: 'TXN-91825', status: 'IGNORED', retryCount: 0, agentDecision: 'IGNORE', agentReason: 'Insufficient funds — not recoverable by retry', agentConfidence: 0.95, policyDecision: 'ALLOWED', policyReason: 'Ignore action permitted', recoveryProbability: 0.05, lastAction: 'IGNORE', lastActionAt: '2026-08-26T17:55:02Z', openedAt: '2026-08-26T17:55:00Z', closedAt: '2026-08-26T17:55:03Z' },
];

export const TXN_91823_RISK: RiskScore = {
  transactionId: 'TXN-91823',
  score: 87,
  atRisk: true,
  riskLevel: 'VERY_HIGH',
  primaryReason: 'BANK_TIMEOUT with high payment history — strong retry candidate',
  estimatedRecoveryProbability: 0.87,
};

export const TXN_82193_RISK: RiskScore = {
  transactionId: 'TXN-82193',
  score: 42,
  atRisk: true,
  riskLevel: 'MEDIUM',
  primaryReason: 'REPEATED_FAILURE — low recovery probability',
  estimatedRecoveryProbability: 0.42,
};

export const MOCK_CUSTOMER_HISTORY: Record<string, { successfulPayments: number; failedPayments: number; totalAmountPaise: number; successRate: number }> = {
  'CUST-00042': { successfulPayments: 8, failedPayments: 0, totalAmountPaise: 3850000, successRate: 1.0 },
  'CUST-00089': { successfulPayments: 2, failedPayments: 3, totalAmountPaise: 2750000, successRate: 0.4 },
  'CUST-00103': { successfulPayments: 5, failedPayments: 1, totalAmountPaise: 1200000, successRate: 0.83 },
  'CUST-00217': { successfulPayments: 3, failedPayments: 2, totalAmountPaise: 550000, successRate: 0.6 },
  'CUST-00341': { successfulPayments: 12, failedPayments: 0, totalAmountPaise: 4800000, successRate: 1.0 },
};
