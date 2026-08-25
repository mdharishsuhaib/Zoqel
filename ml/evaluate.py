#!/usr/bin/env python3
"""
Zoqel — Model Evaluation on Held-Out Test Set

Evaluates the trained recovery prediction model on the held-out test set
(15% of data, never seen during training or validation).

IMPORTANT: These are the numbers that go in the submission.
           They must never be the same as the training/validation numbers.

Usage:
    python evaluate.py

Output:
    evaluation/results.json     — Full evaluation metrics (consumed by frontend)
    evaluation/report.txt       — Human-readable evaluation report
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # non-interactive backend for headless environments
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    roc_auc_score, accuracy_score,
    confusion_matrix, classification_report,
    roc_curve, precision_recall_curve, average_precision_score,
)

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR    = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR  = os.path.join(SCRIPT_DIR, '..', 'datasets')
EVAL_DIR      = os.path.join(SCRIPT_DIR, '..', 'evaluation')
MODEL_PATH    = os.path.join(SCRIPT_DIR, 'model.pkl')
INFO_PATH     = os.path.join(SCRIPT_DIR, 'model_info.json')
RESULTS_PATH  = os.path.join(EVAL_DIR, 'results.json')
REPORT_PATH   = os.path.join(EVAL_DIR, 'report.txt')

os.makedirs(EVAL_DIR, exist_ok=True)

# ─── Feature definitions (must match train_model.py) ─────────────────────────
CATEGORICAL_FEATURES = ['failure_reason', 'payment_method', 'amount_tier', 'customer_risk_tier']
NUMERIC_FEATURES     = ['amount_paise', 'prev_successful_payments', 'prev_failures',
                        'days_since_last_success', 'customer_age_days', 'hour_of_day', 'day_of_week']
ALL_FEATURES = CATEGORICAL_FEATURES + NUMERIC_FEATURES
TARGET = 'recovery_outcome'


def load_test_data():
    test_path = os.path.join(DATASETS_DIR, 'transactions_test.csv')
    if not os.path.exists(test_path):
        print("[ERROR] Test data not found. Run generate_dataset.py first.")
        sys.exit(1)
    return pd.read_csv(test_path)


def compute_business_metrics(df: pd.DataFrame, y_pred: np.ndarray) -> dict:
    """Compute ₹ business metrics from the test set."""
    df = df.copy()
    df['predicted_recovered'] = y_pred
    df['actual_recovered'] = df[TARGET]

    # Revenue at risk = all transactions in test set
    revenue_at_risk_paise = df['amount_paise'].sum()

    # True positives: actually recovered + predicted recovered
    tp_mask = (df['actual_recovered'] == 1) & (df['predicted_recovered'] == 1)
    # False positives: not actually recoverable + predicted recovered (wasted intervention)
    fp_mask = (df['actual_recovered'] == 0) & (df['predicted_recovered'] == 1)
    # False negatives: actually recoverable + predicted not recovered (missed revenue)
    fn_mask = (df['actual_recovered'] == 1) & (df['predicted_recovered'] == 0)

    revenue_recovered_paise      = df.loc[tp_mask, 'amount_paise'].sum()
    revenue_missed_paise         = df.loc[fn_mask, 'amount_paise'].sum()
    revenue_falsely_intervened_paise = df.loc[fp_mask, 'amount_paise'].sum()

    # Truly recoverable revenue (ground truth)
    truly_recoverable_paise = df[df['actual_recovered'] == 1]['amount_paise'].sum()

    recovery_rate = (
        revenue_recovered_paise / max(1, truly_recoverable_paise)
    )

    return {
        'revenue_at_risk_paise':             int(revenue_at_risk_paise),
        'truly_recoverable_paise':           int(truly_recoverable_paise),
        'revenue_recovered_paise':           int(revenue_recovered_paise),
        'revenue_missed_paise':              int(revenue_missed_paise),
        'revenue_falsely_intervened_paise':  int(revenue_falsely_intervened_paise),
        'recovery_rate':                     round(float(recovery_rate), 4),
        'true_positives':                    int(tp_mask.sum()),
        'false_positives':                   int(fp_mask.sum()),
        'false_negatives':                   int(fn_mask.sum()),
        'true_negatives':                    int(((df['actual_recovered'] == 0) & (df['predicted_recovered'] == 0)).sum()),
    }


def plot_confusion_matrix(cm, out_path):
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Not Recovered', 'Recovered'],
                yticklabels=['Not Recovered', 'Recovered'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Zoqel — Confusion Matrix (Test Set)')
    plt.tight_layout()
    plt.savefig(out_path, dpi=120)
    plt.close()
    print(f"  Confusion matrix plot saved: {out_path}")


def plot_roc_curve(y_true, y_prob, auc, out_path):
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, color='#1a56db', lw=2, label=f'AUC = {auc:.3f}')
    plt.plot([0, 1], [0, 1], 'k--', lw=1, label='Random')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Zoqel — ROC Curve (Test Set)')
    plt.legend(loc='lower right')
    plt.tight_layout()
    plt.savefig(out_path, dpi=120)
    plt.close()
    print(f"  ROC curve plot saved: {out_path}")


def main():
    print("=" * 60)
    print("  Zoqel Recovery Model — Held-Out Test Evaluation")
    print(f"  Evaluated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # ── Load model ─────────────────────────────────────────────────────────
    if not os.path.exists(MODEL_PATH):
        print("[ERROR] Model not found. Run train_model.py first.")
        sys.exit(1)

    print("\n  Loading model...")
    pipeline = joblib.load(MODEL_PATH)

    with open(INFO_PATH) as f:
        model_info = json.load(f)

    # ── Load test data ──────────────────────────────────────────────────────
    test_df = load_test_data()
    X_test  = test_df[ALL_FEATURES]
    y_test  = test_df[TARGET]
    print(f"  Test samples: {len(test_df):,}")
    print(f"  Recovery rate (ground truth): {y_test.mean():.1%}")

    # ── Predict ─────────────────────────────────────────────────────────────
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    # ── ML Metrics ──────────────────────────────────────────────────────────
    ml_metrics = {
        'accuracy':            round(float(accuracy_score(y_test, y_pred)),                         4),
        'precision':           round(float(precision_score(y_test, y_pred, zero_division=0)),        4),
        'recall':              round(float(recall_score(y_test, y_pred, zero_division=0)),           4),
        'f1':                  round(float(f1_score(y_test, y_pred, zero_division=0)),               4),
        'auc_roc':             round(float(roc_auc_score(y_test, y_prob)),                           4),
        'avg_precision':       round(float(average_precision_score(y_test, y_prob)),                 4),
        'false_positive_rate': round(float(((y_test == 0) & (y_pred == 1)).sum() / max(1, (y_test == 0).sum())), 4),
        'false_negative_rate': round(float(((y_test == 1) & (y_pred == 0)).sum() / max(1, (y_test == 1).sum())), 4),
    }

    # ── Business Metrics ────────────────────────────────────────────────────
    business_metrics = compute_business_metrics(test_df, y_pred)

    # ── Confusion Matrix ─────────────────────────────────────────────────────
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    # ── Per-failure-reason breakdown ────────────────────────────────────────
    reason_breakdown = {}
    for reason in test_df['failure_reason'].unique():
        mask = test_df['failure_reason'] == reason
        if mask.sum() == 0:
            continue
        reason_breakdown[reason] = {
            'count':          int(mask.sum()),
            'recovery_rate':  round(float(y_test[mask].mean()), 4),
            'predicted_rate': round(float(y_pred[mask].mean()),  4),
            'precision':      round(float(precision_score(y_test[mask], y_pred[mask], zero_division=0)), 4),
            'recall':         round(float(recall_score(y_test[mask], y_pred[mask], zero_division=0)),    4),
        }

    # ── Print summary ────────────────────────────────────────────────────────
    print(f"\n{'─'*60}")
    print("  ML METRICS (Held-Out Test Set)")
    print(f"{'─'*60}")
    for k, v in ml_metrics.items():
        print(f"  {k:<35} {v:.4f}")

    print(f"\n{'─'*60}")
    print("  BUSINESS METRICS (₹)")
    print(f"{'─'*60}")
    bm = business_metrics
    INR = lambda p: f"₹{p/100:,.0f}"
    print(f"  Revenue at Risk:                  {INR(bm['revenue_at_risk_paise'])}")
    print(f"  Truly Recoverable:                {INR(bm['truly_recoverable_paise'])}")
    print(f"  Revenue Recovered (TP):           {INR(bm['revenue_recovered_paise'])}")
    print(f"  Revenue Missed (FN):              {INR(bm['revenue_missed_paise'])}")
    print(f"  False Interventions (FP):         {INR(bm['revenue_falsely_intervened_paise'])}")
    print(f"  Recovery Rate:                    {bm['recovery_rate']:.1%}")
    print(f"  True Positives:                   {bm['true_positives']:,}")
    print(f"  False Positives:                  {bm['false_positives']:,}")
    print(f"  False Negatives:                  {bm['false_negatives']:,}")
    print(f"  True Negatives:                   {bm['true_negatives']:,}")

    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not Recovered', 'Recovered']))

    # ── Generate plots ───────────────────────────────────────────────────────
    plot_confusion_matrix(cm, os.path.join(EVAL_DIR, 'confusion_matrix.png'))
    plot_roc_curve(y_test, y_prob, ml_metrics['auc_roc'],
                   os.path.join(EVAL_DIR, 'roc_curve.png'))

    # ── Save results.json ────────────────────────────────────────────────────
    results = {
        'evaluated_at': datetime.now().isoformat(),
        'test_samples': len(test_df),
        'ground_truth_recovery_rate': round(float(y_test.mean()), 4),
        'ml_metrics': ml_metrics,
        'business_metrics': business_metrics,
        'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)},
        'per_failure_reason': reason_breakdown,
        'model_trained_at': model_info.get('trained_at'),
        'feature_importances': model_info.get('feature_importances', {}),
    }

    with open(RESULTS_PATH, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n  Results saved to: {RESULTS_PATH}")

    # ── Write human-readable report ──────────────────────────────────────────
    report_lines = [
        "=" * 60,
        "  ZOQEL — EVALUATION REPORT (HELD-OUT TEST SET)",
        f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "=" * 60,
        "",
        "  These metrics come from the held-out test set.",
        "  This data was never seen during training or validation.",
        "",
        "  ML METRICS",
        "  " + "-" * 40,
        *[f"  {k:<35} {v:.4f}" for k, v in ml_metrics.items()],
        "",
        "  BUSINESS METRICS",
        "  " + "-" * 40,
        f"  Revenue at Risk:         {INR(bm['revenue_at_risk_paise'])}",
        f"  Truly Recoverable:       {INR(bm['truly_recoverable_paise'])}",
        f"  Revenue Recovered:       {INR(bm['revenue_recovered_paise'])}",
        f"  Revenue Missed (FN):     {INR(bm['revenue_missed_paise'])}",
        f"  False Interventions:     {INR(bm['revenue_falsely_intervened_paise'])}",
        f"  Recovery Rate:           {bm['recovery_rate']:.1%}",
        "",
        "  Per-Failure-Reason Breakdown",
        "  " + "-" * 40,
        *[
            f"  {r:<25} count={v['count']:>4}  recovery={v['recovery_rate']:.0%}  "
            f"precision={v['precision']:.2f}  recall={v['recall']:.2f}"
            for r, v in reason_breakdown.items()
        ],
        "",
        "=" * 60,
    ]

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    print(f"  Report saved to: {REPORT_PATH}")

    print(f"\n{'='*60}")
    print(f"  Evaluation complete.")
    print(f"  Test F1:   {ml_metrics['f1']:.4f}")
    print(f"  Test AUC:  {ml_metrics['auc_roc']:.4f}")
    print(f"  ₹ Recovered: {INR(bm['revenue_recovered_paise'])}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
