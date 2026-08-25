# Zoqel
## AI-Powered Revenue Recovery Agent

> **"Zoqel closes the revenue-recovery loop and measures the monetary outcome."**

[![Track](https://img.shields.io/badge/Razorpay-Track%2003%3A%20AI%20Revenue%20Recovery-blue)](https://razorpay.com)
[![Stack](https://img.shields.io/badge/Stack-Java%20%7C%20React%20%7C%20Python-orange)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## Problem

Payment failure ≠ lost revenue.

A merchant with 10,000 monthly transactions may have hundreds of failures that are **recoverable** — temporary bank timeouts, network errors, retriable conditions — yet lose that revenue simply because there is no system intelligent enough to distinguish a recoverable failure from a permanent one and act on it safely.

A simple payment dashboard can show you that a payment failed.  
**Zoqel goes further.**

---

## What Zoqel Does

```
DETECT → DIAGNOSE → PREDICT → DECIDE → VALIDATE → EXECUTE → VERIFY → MEASURE
```

| Step | Question Answered | Zoqel's Answer |
|---|---|---|
| **Detect** | Is revenue at risk? | Risk score 0–100, atRisk flag |
| **Diagnose** | Why did it fail? | Failure reason classification |
| **Predict** | Can it be recovered? | ML-based recovery probability |
| **Decide** | What should be done? | AI agent: RETRY / NOTIFY / ESCALATE / IGNORE |
| **Validate** | Is this action permitted? | Policy engine: ALLOWED / BLOCKED |
| **Execute** | Carry out the action | Payment simulator (deterministic, safe) |
| **Verify** | Did it work? | Outcome recorded in audit trail |
| **Measure** | How much revenue recovered? | ₹ amount, recovery rate, batch metrics |

---

## Key Metrics (from Held-Out Evaluation)

> These numbers are populated at evaluation time — never hard-coded.  
> Run `python ml/evaluate.py` after training to see real numbers.

| Metric | Value |
|---|---|
| Revenue at Risk | *from evaluation* |
| Revenue Recovered | *from evaluation* |
| Recovery Rate | *from evaluation* |
| Precision | *from evaluation* |
| Recall | *from evaluation* |
| F1 Score | *from evaluation* |

---

## Architecture

```
Synthetic Payment Event
         │
         ▼
  Revenue Risk Detector
  (rule-based scoring, 0-100)
         │
         ▼
  ML Recovery Predictor
  (HistGradientBoostingClassifier, trained on 7,000 transactions)
         │
         ▼
  Zoqel AI Agent
  (GPT-4o via OpenRouter, structured JSON output)
         │
         ▼ recommendation
  ┌──────────────────┐
  │  Policy Engine   │ ← THE SAFETY LAYER
  │  (deterministic) │
  └──────┬───────────┘
         │
    ┌────┴────┐
    ▼         ▼
 ALLOWED   BLOCKED
    │         │
    ▼         ▼
 Payment  Human
Simulator Review
    │
    ▼
 Audit Log (immutable)
    │
    ▼
 ₹ Revenue Recovered
```

### The Central Architectural Rule

> **The LLM recommends. The deterministic system authorizes.**

The AI agent never directly executes a payment action. Its structured JSON recommendation always passes through the deterministic Policy Engine before any action occurs. This makes the system safe, auditable, and explainable.

---

## Safety Boundaries

The Policy Engine enforces:

| Rule | Default |
|---|---|
| Maximum automatic retries per transaction | 1 |
| Minimum agent confidence for automatic action | 75% |
| Maximum transaction value for automatic recovery | ₹10,000 |
| Insufficient funds → retry blocked | Always |
| Duplicate attempt → retry blocked | Always |
| ≥3 customer failures → human escalation | Always |
| Maximum interventions per case | 2 |

All rules are stored in the `policy_rules` database table and can be updated without code changes.

---

## Components

| Component | Language | Purpose |
|---|---|---|
| `backend/` | Java 21 + Spring Boot 3.3 | REST API, orchestration, DB |
| `frontend/` | React 18 + TypeScript + Tailwind | Dashboard + Transaction Explorer |
| `ml/` | Python 3.11 + scikit-learn | Dataset generation, model training, evaluation |
| `payment-simulator` | *(inside backend)* | Deterministic outcome simulation |
| `policy-engine` | *(inside backend)* | Rule validation + safety guardrails |
| `audit-trail` | *(inside backend)* | Immutable event log |

---

## How to Run

### Prerequisites
- Docker + Docker Compose
- Git
- (For ML) Python 3.11+

### Quick Start

```bash
# 1. Clone
git clone https://github.com/your-username/zoqel.git
cd zoqel

# 2. Configure environment
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY=sk-or-v1-...

# 3. Start everything
docker compose up --build

# 4. Open the dashboard
open http://localhost:3000
```

### API Health Check

```bash
curl http://localhost:8080/actuator/health
# → {"status":"UP"}
```

### Generate Synthetic Dataset

```bash
cd ml
pip install -r requirements.txt
python generate_dataset.py
# → datasets/transactions_train.csv (7,000 rows)
# → datasets/transactions_val.csv   (1,500 rows)
# → datasets/transactions_test.csv  (1,500 rows)
```

### Train the Recovery Prediction Model

```bash
python ml/train_model.py
# → ml/model.pkl
# → ml/model_info.json
```

### Evaluate on Held-Out Test Set

```bash
python ml/evaluate.py
# → evaluation/results.json
# → evaluation/report.txt
# → evaluation/confusion_matrix.png
# → evaluation/roc_curve.png
```

### Try the Recovery Workflow

```bash
# 1. Simulate a failed payment
curl -X POST http://localhost:8080/api/transactions/simulate \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-00001","amountPaise":499900,"failureReason":"BANK_TIMEOUT","paymentMethod":"UPI"}'

# 2. Process recovery (runs full AI → Policy → Simulator workflow)
curl -X POST http://localhost:8080/api/recovery/process/TXN-000001

# 3. View the audit trail
curl http://localhost:8080/api/audit/TXN-000001

# 4. Check dashboard metrics
curl http://localhost:8080/api/dashboard/metrics
```

---

## Agent Recovery Decisions

| Condition | Decision |
|---|---|
| Temporary failure (BANK_TIMEOUT / NETWORK_ERROR) + high recovery probability + no previous retry | **RETRY** |
| Permanent failure (INSUFFICIENT_FUNDS) | **IGNORE** |
| Expired card + low confidence | **NOTIFY** |
| Repeated failures (≥3) + low recovery probability | **ESCALATE** |

---

## Evaluation Strategy

Zoqel uses a strict 70/15/15 train/validation/test split.

The final performance numbers — reported in `evaluation/results.json` and shown in the dashboard — come from the **held-out test set only**. This set is never used during training or hyperparameter tuning.

We report both ML metrics (Precision, Recall, F1, AUC-ROC) and business metrics (₹ recovered, ₹ missed, false-positive intervention cost).

---

## Known Limitations & Honest Failures

See [`docs/failure-analysis.md`](docs/failure-analysis.md) for a documented log of real failures encountered during development and how they were resolved.

---

## Documentation

| Document | Purpose |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | System architecture + data flow |
| [`docs/design-decisions.md`](docs/design-decisions.md) | Key technical decisions and rationale |
| [`docs/failure-analysis.md`](docs/failure-analysis.md) | Real failures encountered + fixes |
| [`docs/evaluation.md`](docs/evaluation.md) | Evaluation methodology + metrics interpretation |

---

## Scope

**Zoqel MVP covers:**
- ✅ Failed-payment recovery (synthetic data + payment simulator)
- ✅ AI agent with structured tool use
- ✅ ML-based recovery probability prediction
- ✅ Deterministic policy guardrails
- ✅ Complete audit trail
- ✅ ₹ revenue-recovered measurement

**Intentionally out of scope (future extensions):**
- ❌ Real payment processing
- ❌ Real customer data
- ❌ Checkout abandonment / subscription recovery
- ❌ Multi-agent systems

---

## License

MIT — see [LICENSE](LICENSE).

---

*Zoqel — AI-Powered Revenue Recovery Agent*  
*Built for Razorpay Prove It — Track 03: AI Revenue Recovery*
