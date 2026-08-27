export type FailureReason = 'BANK_TIMEOUT' | 'NETWORK_ERROR' | 'INSUFFICIENT_FUNDS' | 'EXPIRED_CARD' | 'DUPLICATE_ATTEMPT' | 'REPEATED_FAILURE' | 'UNKNOWN';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'RECOVERED' | 'IGNORED' | 'ESCALATED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
export type RecoveryAction = 'RETRY' | 'NOTIFY' | 'ESCALATE' | 'IGNORE';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';
export type RecoveryCaseStatus = 'OPEN' | 'IN_PROGRESS' | 'RECOVERED' | 'FAILED' | 'ESCALATED' | 'IGNORED';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  riskTier: RiskTier;
  joinedAt: string;
  lifetimeValuePaise: number;
}

export interface Transaction {
  id: string;
  customer: Customer;
  amountPaise: number;
  status: TransactionStatus;
  failureReason?: FailureReason;
  paymentMethod: PaymentMethod;
  simulatorSeed: number;
  initiatedAt: string;
  settledAt?: string;
  createdAt: string;
}

export interface RiskScore {
  transactionId: string;
  score: number;
  atRisk: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  primaryReason: string;
  estimatedRecoveryProbability: number;
}

export interface AgentDecision {
  decision: RecoveryAction;
  reason: string;
  confidence: number;
  requiresHuman: boolean;
}

export interface RecoveryCase {
  id: string;
  transactionId: string;
  status: RecoveryCaseStatus;
  retryCount: number;
  agentDecision?: RecoveryAction;
  agentReason?: string;
  agentConfidence?: number;
  policyDecision?: 'ALLOWED' | 'BLOCKED';
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
  actor: string;
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

export interface ChartDataPoint {
  date: string;
  atRisk: number;
  recoverable: number;
  recovered: number;
}

export interface SimulatorStep {
  id: string;
  label: string;
  detail: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  durationMs: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
