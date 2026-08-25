#!/usr/bin/env python3
"""
Zoqel — Synthetic Payment Dataset Generator

Generates 10,000 synthetic failed-payment transactions with realistic
feature distributions and ground-truth recovery outcomes.

The outcome probabilities EXACTLY match the PaymentSimulator's deterministic
logic in the Java backend, ensuring the ML model is trained on realistic data.

Usage:
    python generate_dataset.py

Output:
    datasets/transactions_train.csv  (70% — 7,000 rows)
    datasets/transactions_val.csv    (15% — 1,500 rows)
    datasets/transactions_test.csv   (15% — 1,500 rows)
"""

import os
import uuid
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# --- Reproducibility ---------------------------------------------------------
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# --- Constants ----------------------------------------------------------------
N_TRANSACTIONS = 10_000
N_CUSTOMERS = 500
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'datasets')

# Failure reason distribution (among failed transactions)
FAILURE_REASONS = {
    'BANK_TIMEOUT':        {'weight': 0.28, 'base_recovery_prob': 0.80},
    'NETWORK_ERROR':       {'weight': 0.22, 'base_recovery_prob': 0.75},
    'INSUFFICIENT_FUNDS':  {'weight': 0.20, 'base_recovery_prob': 0.05},
    'EXPIRED_CARD':        {'weight': 0.13, 'base_recovery_prob': 0.10},
    'REPEATED_FAILURE':    {'weight': 0.10, 'base_recovery_prob': 0.15},
    'UNKNOWN':             {'weight': 0.04, 'base_recovery_prob': 0.30},
    'DUPLICATE_ATTEMPT':   {'weight': 0.03, 'base_recovery_prob': 0.00},
}

PAYMENT_METHODS = ['UPI', 'CARD', 'NETBANKING', 'WALLET']
PAYMENT_METHOD_WEIGHTS = [0.55, 0.25, 0.15, 0.05]

# Amount tiers in paise (1 INR = 100 paise)
AMOUNT_TIERS = {
    'LOW':    (50_00, 499_99),      # INR 50 – INR 499
    'MEDIUM': (500_00, 4999_99),    # INR 500 – INR 4,999
    'HIGH':   (5000_00, 100000_00), # INR 5,000 – INR 1,00,000
}
AMOUNT_TIER_WEIGHTS = [0.30, 0.55, 0.15]


def generate_customers(n: int) -> pd.DataFrame:
    """Generate synthetic customer base."""
    customers = []
    risk_tiers = np.random.choice(
        ['LOW', 'MEDIUM', 'HIGH'],
        size=n,
        p=[0.30, 0.55, 0.15]
    )
    for i in range(n):
        joined_days_ago = random.randint(30, 4 * 365)  # 1 month to 4 years
        customers.append({
            'customer_id': f'CUST-{str(i+1).zfill(5)}',
            'risk_tier': risk_tiers[i],
            'customer_age_days': joined_days_ago,
            # Historical payment behaviour (will be computed per-transaction)
        })
    return pd.DataFrame(customers)


def generate_customer_history(customers: pd.DataFrame) -> dict:
    """Pre-generate realistic payment histories for each customer."""
    histories = {}
    for _, cust in customers.iterrows():
        cid = cust['customer_id']
        risk_tier = cust['risk_tier']
        age_days = cust['customer_age_days']

        # How active is this customer?
        total = random.randint(max(1, age_days // 30), max(2, age_days // 7))
        total = min(total, 200)  # cap

        # Success rate by risk tier
        if risk_tier == 'LOW':
            success_rate = random.uniform(0.88, 1.00)
        elif risk_tier == 'MEDIUM':
            success_rate = random.uniform(0.65, 0.92)
        else:  # HIGH
            success_rate = random.uniform(0.30, 0.70)

        successful = round(total * success_rate)
        failed = total - successful

        histories[cid] = {
            'total': total,
            'successful': successful,
            'failed': failed,
            'success_rate': successful / max(1, total),
        }
    return histories


def sample_failure_reason() -> str:
    reasons = list(FAILURE_REASONS.keys())
    weights = [FAILURE_REASONS[r]['weight'] for r in reasons]
    return random.choices(reasons, weights=weights, k=1)[0]


def sample_amount_paise() -> tuple[int, str]:
    tier = random.choices(list(AMOUNT_TIERS.keys()), weights=AMOUNT_TIER_WEIGHTS, k=1)[0]
    low, high = AMOUNT_TIERS[tier]
    amount = random.randint(low, high)
    return amount, tier


def compute_recovery_outcome(
    failure_reason: str,
    customer_success_rate: float,
    customer_failed: int,
    simulator_seed: int,
) -> int:
    """
    Deterministic outcome matching PaymentSimulator.java logic.
    Uses: Random(seed + attemptNumber * 31337L), roll < threshold → SUCCESS
    attemptNumber=2 for first retry.
    """
    attempt_number = 2
    rng = random.Random(simulator_seed + attempt_number * 31337)
    roll = rng.random()

    base_prob = FAILURE_REASONS[failure_reason]['base_recovery_prob']

    # Adjust for customer quality (minor modifier, ±10%)
    if customer_success_rate > 0.9:
        prob = min(1.0, base_prob + 0.05)
    elif customer_success_rate < 0.4:
        prob = max(0.0, base_prob - 0.10)
    else:
        prob = base_prob

    # High repeat failures reduce probability
    if customer_failed >= 5:
        prob = max(0.0, prob - 0.10)

    return 1 if roll < prob else 0


def generate_dataset(n: int = N_TRANSACTIONS) -> pd.DataFrame:
    """Generate the full synthetic transaction dataset."""
    print(f"[Zoqel Dataset Generator] Generating {n:,} transactions...")

    customers = generate_customers(N_CUSTOMERS)
    histories = generate_customer_history(customers)
    customer_ids = customers['customer_id'].tolist()

    rows = []
    base_time = datetime(2024, 1, 1)

    for i in range(n):
        txn_id = f'TXN-{str(i+1).zfill(6)}'
        cid = random.choice(customer_ids)
        hist = histories[cid]
        cust = customers[customers['customer_id'] == cid].iloc[0]

        failure_reason = sample_failure_reason()
        amount_paise, amount_tier = sample_amount_paise()
        simulator_seed = random.randint(1000, 999_999)

        # Transaction timing
        days_offset = random.randint(0, 365)
        hour = random.randint(6, 23)
        tx_time = base_time + timedelta(days=days_offset, hours=hour)

        days_since_last_success = random.randint(0, 90) if hist['successful'] > 0 else 999

        recovery_outcome = compute_recovery_outcome(
            failure_reason,
            hist['success_rate'],
            hist['failed'],
            simulator_seed,
        )

        rows.append({
            'transaction_id': txn_id,
            'customer_id': cid,
            'amount_paise': amount_paise,
            'amount_tier': amount_tier,
            'failure_reason': failure_reason,
            'payment_method': random.choices(PAYMENT_METHODS, weights=PAYMENT_METHOD_WEIGHTS, k=1)[0],
            'prev_successful_payments': hist['successful'],
            'prev_failures': hist['failed'],
            'days_since_last_success': days_since_last_success,
            'customer_age_days': int(cust['customer_age_days']),
            'customer_risk_tier': cust['risk_tier'],
            'hour_of_day': hour,
            'day_of_week': tx_time.weekday(),
            'simulator_seed': simulator_seed,
            'recovery_outcome': recovery_outcome,  # 1=recovered, 0=not recovered
        })

        if (i + 1) % 1000 == 0:
            print(f"  Generated {i+1:,} / {n:,} transactions...")

    df = pd.DataFrame(rows)
    return df


def print_statistics(df: pd.DataFrame, label: str):
    """Print dataset statistics."""
    print(f"\n{'='*60}")
    print(f"  {label} — {len(df):,} rows")
    print(f"{'='*60}")
    print(f"  Recovery rate:     {df['recovery_outcome'].mean():.1%}")
    print(f"  Avg amount:        INR {df['amount_paise'].mean()/100:,.0f}")
    print("\n  Failure reason distribution:")
    for reason, count in df['failure_reason'].value_counts().items():
        rate = df[df['failure_reason'] == reason]['recovery_outcome'].mean()
        print(f"    {reason:<25} {count:>5} rows  ({rate:.0%} recovery)")
    print(f"\n  Amount tiers:")
    for tier, count in df['amount_tier'].value_counts().items():
        print(f"    {tier:<10} {count:>5} rows")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # -- Generate full dataset ----------------------------------------------
    df = generate_dataset(N_TRANSACTIONS)

    # -- Train / Val / Test split (70 / 15 / 15) ---------------------------
    df_shuffled = df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    n = len(df_shuffled)
    train_end = int(n * 0.70)
    val_end   = int(n * 0.85)

    train = df_shuffled.iloc[:train_end]
    val   = df_shuffled.iloc[train_end:val_end]
    test  = df_shuffled.iloc[val_end:]

    # -- Save splits --------------------------------------------------------
    train_path = os.path.join(OUTPUT_DIR, 'transactions_train.csv')
    val_path   = os.path.join(OUTPUT_DIR, 'transactions_val.csv')
    test_path  = os.path.join(OUTPUT_DIR, 'transactions_test.csv')

    train.to_csv(train_path, index=False)
    val.to_csv(val_path,     index=False)
    test.to_csv(test_path,   index=False)

    print_statistics(train, 'TRAIN SET')
    print_statistics(val,   'VALIDATION SET')
    print_statistics(test,  'TEST SET (HELD-OUT)')

    print(f"\n{'='*60}")
    print(f"  Dataset saved:")
    print(f"    Train: {train_path}")
    print(f"    Val:   {val_path}")
    print(f"    Test:  {test_path}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
