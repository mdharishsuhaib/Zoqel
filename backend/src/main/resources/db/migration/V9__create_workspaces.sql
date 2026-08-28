CREATE TABLE workspaces (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO workspaces (id, name, business_type) VALUES ('demo-workspace', 'Zoqel Demo Workspace', 'SaaS');

ALTER TABLE app_users ADD COLUMN workspace_id VARCHAR(36) REFERENCES workspaces(id);
UPDATE app_users SET workspace_id = 'demo-workspace';

ALTER TABLE customers ADD COLUMN workspace_id VARCHAR(36) REFERENCES workspaces(id);
UPDATE customers SET workspace_id = 'demo-workspace';
ALTER TABLE customers ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE customers DROP CONSTRAINT customers_email_key;
ALTER TABLE customers ADD CONSTRAINT customers_workspace_email_unique UNIQUE (workspace_id, email);

ALTER TABLE transactions ADD COLUMN workspace_id VARCHAR(36) REFERENCES workspaces(id);
UPDATE transactions SET workspace_id = 'demo-workspace';
ALTER TABLE transactions ALTER COLUMN workspace_id SET NOT NULL;

ALTER TABLE recovery_cases ADD COLUMN workspace_id VARCHAR(36) REFERENCES workspaces(id);
UPDATE recovery_cases SET workspace_id = 'demo-workspace';
ALTER TABLE recovery_cases ALTER COLUMN workspace_id SET NOT NULL;

ALTER TABLE audit_events ADD COLUMN workspace_id VARCHAR(36) REFERENCES workspaces(id);
UPDATE audit_events SET workspace_id = 'demo-workspace';
ALTER TABLE audit_events ALTER COLUMN workspace_id SET NOT NULL;

ALTER TABLE policy_rules ADD COLUMN workspace_id VARCHAR(36) REFERENCES workspaces(id);
UPDATE policy_rules SET workspace_id = 'demo-workspace';
ALTER TABLE policy_rules ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE policy_rules DROP CONSTRAINT policy_rules_rule_key_key;
ALTER TABLE policy_rules ADD CONSTRAINT policy_rules_workspace_key_unique UNIQUE (workspace_id, rule_key);
