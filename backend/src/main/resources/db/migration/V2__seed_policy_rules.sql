INSERT INTO policy_rules (rule_key, rule_value, description) VALUES
  ('max_retries_per_transaction', '1', 'Maximum number of automatic retry attempts per transaction'),
  ('min_recovery_confidence', '0.75', 'Minimum agent confidence score required for automatic action'),
  ('max_auto_amount_paise', '1000000', 'Maximum transaction amount (paise) for automatic recovery (=INR 10,000)'),
  ('block_insufficient_funds_retry', 'true', 'Block automatic retry for insufficient_funds failure reason'),
  ('block_duplicate_attempt_retry', 'true', 'Block automatic retry for duplicate_attempt failure reason'),
  ('require_human_for_repeated_failure', 'true', 'Escalate to human if customer has 3+ previous failures'),
  ('max_interventions_per_case', '2', 'Maximum total interventions (retries + notifications) per recovery case')
ON CONFLICT (rule_key) DO NOTHING;
