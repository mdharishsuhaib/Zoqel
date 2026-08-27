import type { AuditEvent } from '../types';

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  { id: 1, transactionId: 'TXN-91823', eventType: 'RISK_DETECTED', eventDetail: 'Payment TXN-91823 detected as revenue at risk. Risk score: 87/100. Estimated recovery probability: 87%.', actor: 'Risk Engine', occurredAt: '2026-08-26T18:42:11Z' },
  { id: 2, transactionId: 'TXN-91823', eventType: 'RECOVERY_CASE_OPENED', eventDetail: 'Recovery case RC-0001 opened for TXN-91823.', actor: 'Zoqel', occurredAt: '2026-08-26T18:42:11Z' },
  { id: 3, transactionId: 'TXN-91823', eventType: 'PROBABILITY_CALCULATED', eventDetail: 'Recovery probability: 87%. Risk score: 87. Failure: BANK_TIMEOUT. Customer success rate: 100%.', actor: 'ML Engine', occurredAt: '2026-08-26T18:42:12Z' },
  { id: 4, transactionId: 'TXN-91823', eventType: 'AGENT_DECISION', eventDetail: 'Decision: RETRY. Confidence: 87%. Reason: Temporary bank timeout with strong payment history.', actor: 'AI Agent', occurredAt: '2026-08-26T18:42:12Z' },
  { id: 5, transactionId: 'TXN-91823', eventType: 'POLICY_VALIDATED', eventDetail: 'Action RETRY authorized. 4/4 policy checks passed. Amount: INR 4,999 < INR 10,000. Retries: 0 < 1. Confidence: 87% > 75%.', actor: 'Policy Engine', occurredAt: '2026-08-26T18:42:12Z' },
  { id: 6, transactionId: 'TXN-91823', eventType: 'ACTION_EXECUTED', eventDetail: 'Payment retry #1 initiated via payment simulator. Seed: 42819.', actor: 'Zoqel', occurredAt: '2026-08-26T18:42:13Z' },
  { id: 7, transactionId: 'TXN-91823', eventType: 'OUTCOME_RECORDED', eventDetail: 'Retry outcome: SUCCESS. Payment completed.', actor: 'Simulator', occurredAt: '2026-08-26T18:42:15Z' },
  { id: 8, transactionId: 'TXN-91823', eventType: 'RECOVERY_CASE_CLOSED', eventDetail: 'Recovery case RC-0001 closed. Status: RECOVERED. Revenue recovered: INR 4,999.', actor: 'Zoqel', occurredAt: '2026-08-26T18:42:15Z' },
  { id: 9, transactionId: 'TXN-82193', eventType: 'RISK_DETECTED', eventDetail: 'Payment TXN-82193 detected as revenue at risk. Risk score: 42/100.', actor: 'Risk Engine', occurredAt: '2026-08-26T17:18:44Z' },
  { id: 10, transactionId: 'TXN-82193', eventType: 'RECOVERY_CASE_OPENED', eventDetail: 'Recovery case RC-0002 opened.', actor: 'Zoqel', occurredAt: '2026-08-26T17:18:44Z' },
  { id: 11, transactionId: 'TXN-82193', eventType: 'PROBABILITY_CALCULATED', eventDetail: 'Recovery probability: 42%. Failure: REPEATED_FAILURE. 3 previous failures.', actor: 'ML Engine', occurredAt: '2026-08-26T17:18:45Z' },
  { id: 12, transactionId: 'TXN-82193', eventType: 'AGENT_DECISION', eventDetail: 'Decision: ESCALATE. Confidence: 42%. Reason: Repeated failure pattern with low recovery probability.', actor: 'AI Agent', occurredAt: '2026-08-26T17:18:46Z' },
  { id: 13, transactionId: 'TXN-82193', eventType: 'POLICY_BLOCKED', eventDetail: 'Action blocked. Violations: (1) Amount INR 27,500 > INR 10,000 limit. (2) 3 failures — human review required.', actor: 'Policy Engine', occurredAt: '2026-08-26T17:18:47Z' },
  { id: 14, transactionId: 'TXN-82193', eventType: 'HUMAN_ESCALATED', eventDetail: 'Case escalated to human review. No automatic action executed. Reason: policy block.', actor: 'Zoqel', occurredAt: '2026-08-26T17:18:50Z' },
];
