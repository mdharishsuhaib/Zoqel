export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  joinedAt: string;
  createdAt: string;
}

export interface CustomerHistory {
  customerId: string;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  totalAmountPaise: number;
  lastPaymentAt?: string;
  lastFailureAt?: string;
}

export type FailureReason =
  | 'BANK_TIMEOUT'
  | 'NETWORK_ERROR'
  | 'INSUFFICIENT_FUNDS'
  | 'EXPIRED_CARD'
  | 'DUPLICATE_ATTEMPT'
  | 'REPEATED_FAILURE'
  | 'UNKNOWN';

export type TransactionStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'RECOVERED'
  | 'IGNORED'
  | 'ESCALATED';

export interface Transaction {
  id: string;
  customer: Customer;
  amountPaise: number;
  status: TransactionStatus;
  failureReason?: FailureReason;
  paymentMethod: string;
  simulatorSeed: number;
  initiatedAt: string;
  settledAt?: string;
  createdAt: string;
}

export interface RiskScore {
  transactionId: string;
  score: number;
  atRisk: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  primaryReason: string;
  estimatedRecoveryProbability: number;
}

export interface AgentDecision {
  decision: 'RETRY' | 'NOTIFY' | 'ESCALATE' | 'IGNORE';
  reason: string;
  confidence: number;
  requiresHuman: boolean;
}

export interface RecoveryCase {
  id: string;
  transactionId: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RECOVERED' | 'FAILED' | 'ESCALATED' | 'IGNORED';
  retryCount: number;
  agentDecision?: string;
  agentReason?: string;
  agentConfidence?: number;
  policyDecision?: string;
  policyReason?: string;
  recoveryProbability?: number;
  lastAction?: string;
  lastActionAt?: string;
  openedAt: string;
  closedAt?: string;
}

export interface AuditEvent {
  id: number;
  transactionId: string;
  recoveryCaseId?: string;
  eventType: string;
  eventDetail?: string;
  metadata?: string;
  occurredAt: string;
}

export interface DashboardMetrics {
  totalTransactionsAnalyzed: number;
  failedTransactions: number;
  revenueAtRiskPaise: number;
  recoverableRevenuePaise: number;
  revenueRecoveredPaise: number;
  recoveryRate: number;
  recoveryCandidates: number;
  interventionsExecuted: number;
  successfulRecoveries: number;
  humanEscalations: number;
  blockedActions: number;
  ignoredCases: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
