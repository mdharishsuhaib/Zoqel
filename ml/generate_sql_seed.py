import pandas as pd
import uuid
from datetime import datetime, timedelta
import random

df = pd.read_csv('../datasets/transactions_test.csv')
out_lines = []

unique_customers = df[['customer_id', 'customer_risk_tier']].drop_duplicates()
for _, row in unique_customers.iterrows():
    cid = row['customer_id']
    risk = row['customer_risk_tier']
    out_lines.append(f"MERGE INTO customers (id, name, email, phone, risk_tier, joined_at, created_at, updated_at) KEY(id) VALUES ('{cid}', 'Synthetic {cid}', '{cid}@example.com', '9999999999', '{risk}', '2023-01-01 10:00:00', NOW(), NOW());")

now = datetime.now()
base_time = now - timedelta(days=30)

for idx, row in df.iterrows():
    tid = row['transaction_id']
    cid = row['customer_id']
    amt = int(row['amount_paise'])
    fail_reason = row['failure_reason']
    method = row['payment_method']
    seed = int(row['simulator_seed'])
    outcome = int(row['recovery_outcome'])
    
    t_time = base_time + timedelta(minutes=random.randint(0, 30*24*60))
    t_time_str = t_time.strftime('%Y-%m-%d %H:%M:%S')
    
    txn_status = 'RECOVERED' if outcome == 1 else 'FAILED'
    settled = f"'{t_time_str}'" if outcome == 1 else 'NULL'
    
    out_lines.append(f"INSERT INTO transactions (id, customer_id, amount_paise, status, failure_reason, payment_method, simulator_seed, initiated_at, settled_at, created_at, updated_at) VALUES ('{tid}', '{cid}', {amt}, '{txn_status}', '{fail_reason}', '{method}', {seed}, '{t_time_str}', {settled}, '{t_time_str}', '{t_time_str}');")
    
    out_lines.append(f"INSERT INTO payment_attempts (transaction_id, attempt_number, outcome, failure_reason, attempted_at, created_at) VALUES ('{tid}', 1, 'FAILED', '{fail_reason}', '{t_time_str}', '{t_time_str}');")
    
    agent_action = 'RETRY' if outcome == 1 else 'ESCALATE'
    rec_status = 'RECOVERED' if outcome == 1 else 'ESCALATED'
    out_lines.append(f"INSERT INTO recovery_cases (id, transaction_id, status, retry_count, agent_decision, agent_confidence, policy_decision, recovery_probability, opened_at, created_at, updated_at) VALUES ('{str(uuid.uuid4())}', '{tid}', '{rec_status}', 1, '{agent_action}', 0.85, 'APPROVED', 0.85, '{t_time_str}', '{t_time_str}', '{t_time_str}');")
    
with open('../backend/src/main/resources/db/migration/V4__seed_test_transactions.sql', 'w') as f:
    f.write('\n'.join(out_lines))
print("Generated V4 migration!")
