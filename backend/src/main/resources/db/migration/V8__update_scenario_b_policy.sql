UPDATE recovery_cases 
SET agent_decision = 'RETRY', policy_decision = 'BLOCKED', agent_reason = 'AI recommended automatic retry, but Policy Engine overruled due to amount threshold and repeated failure history.'
WHERE transaction_id = 'TXN-82193';
