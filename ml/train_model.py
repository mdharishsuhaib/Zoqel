#!/usr/bin/env python3
"""
Zoqel — Recovery Prediction Model Trainer

Trains a gradient-boosted classifier on the synthetic payment dataset
to predict whether a failed transaction can be successfully recovered.

Model: HistGradientBoostingClassifier (scikit-learn)
  — Fast, handles missing values natively, interpretable via feature importance
  — No deep learning required: this is a tabular classification problem

Usage:
    # First generate the dataset:
    python generate_dataset.py

    # Then train:
    python train_model.py

Output:
    ml/model.pkl           — Trained model (joblib)
    ml/model_info.json     — Feature list, training metrics, feature importances
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import OrdinalEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    roc_auc_score, accuracy_score, classification_report,
)

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(SCRIPT_DIR, '..', 'datasets')
MODEL_PATH   = os.path.join(SCRIPT_DIR, 'model.pkl')
INFO_PATH    = os.path.join(SCRIPT_DIR, 'model_info.json')

# ─── Feature definitions ─────────────────────────────────────────────────────
CATEGORICAL_FEATURES = [
    'failure_reason',
    'payment_method',
    'amount_tier',
    'customer_risk_tier',
]

NUMERIC_FEATURES = [
    'amount_paise',
    'prev_successful_payments',
    'prev_failures',
    'days_since_last_success',
    'customer_age_days',
    'hour_of_day',
    'day_of_week',
]

ALL_FEATURES = CATEGORICAL_FEATURES + NUMERIC_FEATURES
TARGET = 'recovery_outcome'


def load_data():
    train_path = os.path.join(DATASETS_DIR, 'transactions_train.csv')
    val_path   = os.path.join(DATASETS_DIR, 'transactions_val.csv')

    if not os.path.exists(train_path):
        print("[ERROR] Training data not found. Run generate_dataset.py first.")
        sys.exit(1)

    train = pd.read_csv(train_path)
    val   = pd.read_csv(val_path)

    X_train = train[ALL_FEATURES]
    y_train = train[TARGET]
    X_val   = val[ALL_FEATURES]
    y_val   = val[TARGET]

    return X_train, y_train, X_val, y_val


def build_pipeline() -> Pipeline:
    """Build a sklearn Pipeline with preprocessing and classifier."""
    categorical_transformer = OrdinalEncoder(
        handle_unknown='use_encoded_value',
        unknown_value=-1,
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, CATEGORICAL_FEATURES),
            ('num', 'passthrough', NUMERIC_FEATURES),
        ],
        remainder='drop',
    )

    classifier = HistGradientBoostingClassifier(
        max_iter=300,
        max_depth=6,
        learning_rate=0.05,
        min_samples_leaf=20,
        l2_regularization=0.1,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=20,
        random_state=42,
        class_weight='balanced',
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', classifier),
    ])

    return pipeline


def evaluate(pipeline: Pipeline, X: pd.DataFrame, y: pd.Series, label: str) -> dict:
    """Evaluate the pipeline and return metrics."""
    y_pred = pipeline.predict(X)
    y_prob = pipeline.predict_proba(X)[:, 1]

    metrics = {
        'label': label,
        'samples': len(y),
        'accuracy':   round(accuracy_score(y, y_pred),  4),
        'precision':  round(precision_score(y, y_pred, zero_division=0), 4),
        'recall':     round(recall_score(y, y_pred, zero_division=0),    4),
        'f1':         round(f1_score(y, y_pred, zero_division=0),        4),
        'auc_roc':    round(roc_auc_score(y, y_prob),                    4),
        'false_positive_rate': round(
            ((y == 0) & (y_pred == 1)).sum() / max(1, (y == 0).sum()), 4
        ),
        'false_negative_rate': round(
            ((y == 1) & (y_pred == 0)).sum() / max(1, (y == 1).sum()), 4
        ),
    }

    print(f"\n{'─'*50}")
    print(f"  {label} Metrics ({metrics['samples']:,} samples)")
    print(f"{'─'*50}")
    for k, v in metrics.items():
        if k not in ('label', 'samples'):
            print(f"  {k:<30} {v:.4f}")
    print(f"\n  Classification Report ({label}):")
    print(classification_report(y, y_pred, target_names=['Not Recovered', 'Recovered']))

    return metrics


def main():
    print("=" * 60)
    print("  Zoqel Recovery Prediction Model Training")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # ── Load data ──────────────────────────────────────────────────────────
    X_train, y_train, X_val, y_val = load_data()
    print(f"\n  Training samples: {len(X_train):,}")
    print(f"  Validation samples: {len(X_val):,}")
    print(f"  Features: {len(ALL_FEATURES)}")
    print(f"  Recovery rate (train): {y_train.mean():.1%}")

    # ── Build and train ────────────────────────────────────────────────────
    print("\n  Training HistGradientBoostingClassifier...")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)
    print("  Training complete.")

    # ── Evaluate ───────────────────────────────────────────────────────────
    train_metrics = evaluate(pipeline, X_train, y_train, 'TRAIN')
    val_metrics   = evaluate(pipeline, X_val,   y_val,   'VALIDATION')

    # ── Feature importance (via permutation on categorical names) ──────────
    # HistGradientBoosting exposes feature_importances_ after fitting
    try:
        clf = pipeline.named_steps['classifier']
        importances = clf.feature_importances_
        # After preprocessor: cat features come first (in CATEGORICAL_FEATURES order),
        # then numeric features (in NUMERIC_FEATURES order)
        feature_names = CATEGORICAL_FEATURES + NUMERIC_FEATURES
        importance_dict = {
            name: round(float(imp), 4)
            for name, imp in sorted(
                zip(feature_names, importances),
                key=lambda x: x[1],
                reverse=True,
            )
        }
        print("\n  Feature Importances (top 10):")
        for name, imp in list(importance_dict.items())[:10]:
            bar = '█' * int(imp * 50)
            print(f"  {name:<35} {imp:.4f}  {bar}")
    except Exception as e:
        print(f"  [WARN] Could not extract feature importances: {e}")
        importance_dict = {}

    # ── Save model ─────────────────────────────────────────────────────────
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\n  Model saved to: {MODEL_PATH}")

    # ── Save model info (for backend and evaluation) ───────────────────────
    model_info = {
        'trained_at': datetime.now().isoformat(),
        'features': ALL_FEATURES,
        'categorical_features': CATEGORICAL_FEATURES,
        'numeric_features': NUMERIC_FEATURES,
        'target': TARGET,
        'model_type': 'HistGradientBoostingClassifier',
        'train_metrics': train_metrics,
        'val_metrics': val_metrics,
        'feature_importances': importance_dict,
        'training_samples': len(X_train),
        'validation_samples': len(X_val),
    }

    with open(INFO_PATH, 'w') as f:
        json.dump(model_info, f, indent=2)
    print(f"  Model info saved to: {INFO_PATH}")

    print(f"\n{'='*60}")
    print(f"  Training complete!")
    print(f"  Validation F1:    {val_metrics['f1']:.4f}")
    print(f"  Validation AUC:   {val_metrics['auc_roc']:.4f}")
    print(f"  Run evaluate.py next with the held-out test set.")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
