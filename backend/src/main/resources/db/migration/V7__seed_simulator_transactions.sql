INSERT INTO transactions (id, customer_id, amount_paise, status, failure_reason, payment_method, simulator_seed, initiated_at, settled_at, created_at, updated_at) 
VALUES ('TXN-91823', 'CUST-00281', 499900, 'RECOVERED', 'BANK_TIMEOUT', 'UPI', 123456, NOW(), NOW(), NOW(), NOW());

INSERT INTO payment_attempts (transaction_id, attempt_number, outcome, failure_reason, attempted_at, created_at) 
VALUES ('TXN-91823', 1, 'FAILED', 'BANK_TIMEOUT', NOW(), NOW());

INSERT INTO recovery_cases (id, transaction_id, status, retry_count, agent_decision, agent_confidence, policy_decision, recovery_probability, opened_at, created_at, updated_at) 
VALUES ('11111111-1111-1111-1111-111111111111', 'TXN-91823', 'RECOVERED', 1, 'RETRY', 0.87, 'APPROVED', 0.87, NOW(), NOW(), NOW());

INSERT INTO transactions (id, customer_id, amount_paise, status, failure_reason, payment_method, simulator_seed, initiated_at, settled_at, created_at, updated_at) 
VALUES ('TXN-82193', 'CUST-00413', 2750000, 'ESCALATED', 'REPEATED_FAILURE', 'CARD', 654321, NOW(), NULL, NOW(), NOW());

INSERT INTO payment_attempts (transaction_id, attempt_number, outcome, failure_reason, attempted_at, created_at) 
VALUES ('TXN-82193', 1, 'FAILED', 'REPEATED_FAILURE', NOW(), NOW());

INSERT INTO recovery_cases (id, transaction_id, status, retry_count, agent_decision, agent_confidence, policy_decision, recovery_probability, opened_at, created_at, updated_at) 
VALUES ('22222222-2222-2222-2222-222222222222', 'TXN-82193', 'ESCALATED', 1, 'ESCALATE', 0.42, 'APPROVED', 0.42, NOW(), NOW(), NOW());
