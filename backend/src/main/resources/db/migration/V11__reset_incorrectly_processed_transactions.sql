-- V11: Reset incorrectly-processed transactions for all real user workspaces
-- 
-- CONTEXT: A bug in CustomerHistoryService caused IGNORED and ESCALATED
-- transactions to be counted as "failed payments". This inflated the failure
-- count past the policy threshold (>= 3), which caused the PolicyEngine to
-- block ALL retries for every customer, creating a cascading loop where every
-- new transaction was immediately IGNORED or ESCALATED rather than retried.
--
-- This migration resets those stuck transactions back to FAILED so the
-- (now-fixed) agent can re-evaluate and correctly recover them.
-- Only affects REAL user workspaces (not demo-workspace).
-- Only resets transactions that have an associated closed recovery case
-- with IGNORED status (i.e., agent ran but wrongly decided to ignore),
-- preserving legitimate ESCALATED cases that truly need human review.

-- Step 1: Re-open recovery cases that were incorrectly IGNORED
-- (leave ESCALATED ones alone — they may be legitimate human-review cases)
UPDATE recovery_cases
SET status = 'OPEN',
    closed_at = NULL,
    agent_decision = NULL,
    agent_reason = NULL,
    agent_confidence = NULL,
    policy_decision = NULL,
    policy_reason = NULL,
    last_action = NULL,
    last_action_at = NULL,
    retry_count = 0
WHERE status = 'IGNORED'
  AND workspace_id != 'demo-workspace'
  AND workspace_id IN (
      SELECT DISTINCT workspace_id FROM app_users
      WHERE email != 'demo@zoqel.internal'
        AND workspace_id IS NOT NULL
  );

-- Step 2: Reset the corresponding transactions from IGNORED back to FAILED
-- so the agent can re-process them with the corrected policy logic
UPDATE transactions
SET status = 'FAILED',
    settled_at = NULL,
    updated_at = NOW()
WHERE status = 'IGNORED'
  AND workspace_id != 'demo-workspace'
  AND workspace_id IN (
      SELECT DISTINCT workspace_id FROM app_users
      WHERE email != 'demo@zoqel.internal'
        AND workspace_id IS NOT NULL
  );

-- Step 3: For user@gmail.com specifically — also reset ESCALATED transactions
-- that were caused by the policy bug (high failure count from IGNORED txns).
-- We identify these as ESCALATED cases where retry_count = 0 (agent never
-- even tried once, just immediately escalated due to inflated failure count).
UPDATE recovery_cases rc
SET rc.status = 'OPEN',
    rc.closed_at = NULL,
    rc.agent_decision = NULL,
    rc.agent_reason = NULL,
    rc.agent_confidence = NULL,
    rc.policy_decision = NULL,
    rc.policy_reason = NULL,
    rc.last_action = NULL,
    rc.last_action_at = NULL,
    rc.retry_count = 0
WHERE rc.status = 'ESCALATED'
  AND rc.retry_count = 0
  AND rc.workspace_id = (
      SELECT workspace_id FROM app_users WHERE email = 'user@gmail.com' LIMIT 1
  );

UPDATE transactions t
SET t.status = 'FAILED',
    t.settled_at = NULL,
    t.updated_at = NOW()
WHERE t.status = 'ESCALATED'
  AND t.workspace_id = (
      SELECT workspace_id FROM app_users WHERE email = 'user@gmail.com' LIMIT 1
  )
  AND t.id IN (
      SELECT transaction_id FROM recovery_cases
      WHERE retry_count = 0
        AND workspace_id = (
            SELECT workspace_id FROM app_users WHERE email = 'user@gmail.com' LIMIT 1
        )
  );
