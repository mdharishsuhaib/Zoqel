CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    risk_tier VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    joined_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id),
    amount_paise BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    failure_reason VARCHAR(50),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'UPI',
    simulator_seed INT NOT NULL,
    initiated_at TIMESTAMP NOT NULL,
    settled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL REFERENCES transactions(id),
    attempt_number INT NOT NULL,
    outcome VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    failure_reason VARCHAR(50),
    attempted_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_txn ON payment_attempts(transaction_id);

CREATE TABLE IF NOT EXISTS recovery_cases (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL UNIQUE REFERENCES transactions(id),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    retry_count INT NOT NULL DEFAULT 0,
    agent_decision VARCHAR(20),
    agent_reason TEXT,
    agent_confidence DECIMAL(5,4),
    policy_decision VARCHAR(20),
    policy_reason TEXT,
    recovery_probability DECIMAL(5,4),
    last_action VARCHAR(50),
    last_action_at TIMESTAMP,
    opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL,
    recovery_case_id VARCHAR(36),
    event_type VARCHAR(60) NOT NULL,
    event_detail TEXT,
    metadata TEXT,
    occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_txn ON audit_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_occurred ON audit_events(occurred_at);

CREATE TABLE IF NOT EXISTS policy_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_key VARCHAR(100) UNIQUE NOT NULL,
    rule_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
