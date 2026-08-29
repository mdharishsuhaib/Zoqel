# Zoqel: AI-Powered Autonomous Revenue Recovery

<div align="center">
  <b>Built for the Razorpay AI Buildathon 2026 — Track 03: AI Revenue Recovery</b>
  <br><br>
  <i>Stop losing 30% of your recurring revenue to false declines. Zoqel replaces static "dunning" emails with a deterministic-gated AI Agent that autonomously detects, diagnoses, and safely recovers failed payments before your customers even notice.</i>
</div>

---

## 🚀 Live Demo
- **Frontend App**: [zoqel.mdharishsuhaib.workers.dev](https://zoqel.mdharishsuhaib.workers.dev)
- **Backend API**: [zoqel-8ly3.onrender.com/api](https://zoqel-8ly3.onrender.com/api)
- **Quick Entry**: Navigate to `/demo` in the frontend. You will instantly receive a sandboxed JWT scoped to a `demo-workspace`. No signup required.

> **Note:** The backend runs on a free Render tier and may take ~90 seconds to cold-start. Once live, a background simulator continuously generates synthetic failed transactions every 10 seconds to populate your dashboard.

---

## ⚡ The Problem vs. The Zoqel Solution

**The Problem:** Traditional payment recovery ("dunning") relies on rigid, rule-based retry schedules and spamming customers with emails. It's blind to context and alienates users.

**The Solution:** Zoqel introduces an intelligent, bounded AI Agent that reasons about *why* a payment failed and executes the optimal recovery path. 

Every money action in Zoqel is **explainable, bounded, and gated.**

### The Intelligence Pipeline
```text
[ Razorpay Webhook (payment.failed) ]
                 ↓
[ Deterministic Risk Detection ] (Calculates failure severity 0–100)
                 ↓
[ ML Recovery Probability Model ] (Historical success prediction)
                 ↓
[ Autonomous AI Agent ] (Ollama LLM calculates optimal action + confidence score)
                 ↓
[ Policy Engine Gatekeeper ] ("The LLM recommends. The policy authorises.")
                 ↓
[ Execution & Immutable Audit Log ]
```

---

## 🛡️ Enterprise-Grade Security & Guardrails

We know that giving an AI financial control is risky. Zoqel was built with a "Safety-First" architecture:

1. **Policy-Bounded Guardrails (Track 01 Alignment):** The AI cannot bypass the merchant's rules. If the AI recommends an auto-retry of ₹10,000, but the merchant's Policy Engine caps auto-retries at ₹5,000, the action is hard-blocked and escalated to a human.
2. **Demo Mode Isolation (Track 02 Alignment):** Our Demo Mode isn't just frontend smoke. `DemoGuardFilter` enforces strict write-blocking at the HTTP layer. Unauthenticated webhooks targeting the demo workspace are rejected (`403 Forbidden`). 19/19 cross-tenant isolation tests pass on production.
3. **Webhook Security:** Webhooks strictly require valid Workspace UUIDs (`400 Bad Request` if missing). *(Note: HMAC signature validation is bypassed for the hackathon, but the blast radius is structurally confined to the intelligence pipeline).*

---

## 📈 Measured Results (Held-Out Test Set)

Zoqel’s Machine Learning layer was evaluated against a held-out test set of 10,000 transactions (never seen during training). The numbers speak for themselves:

| Metric | Value |
|---|---|
| **Revenue at Risk** | **₹1.40 crore** |
| **Truly Recoverable** | **₹60.16 lakh** |
| **Revenue Recovered (By Zoqel)** | **₹53.97 lakh** |
| **Recovery Rate** | **89.7%** |
| False Intervention Cost | ₹17.18 lakh |

*The model correctly avoids intervening on structurally unrecoverable failures (e.g., EXPIRED_CARD, INSUFFICIENT_FUNDS), resulting in highly efficient recovery without burning merchant resources.* Full breakdown available in `evaluation/report.txt`.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| **Frontend** | React (Vite), TypeScript, Tailwind CSS | Lightning-fast, utility-first UI deployed to Cloudflare Workers. |
| **Backend** | Java 21, Spring Boot 3.3, Flyway | Enterprise-grade, strongly typed multi-tenant API deployed to Render. |
| **Database** | PostgreSQL 15 (Supabase) | Relational integrity with full JSONB support for audit trails. |
| **AI Layer** | Ollama Cloud API (`gpt-oss:120b-cloud`) | High-reasoning LLM strictly constrained to structured JSON outputs. |
| **ML Layer** | Python 3.11, `scikit-learn` | Fast, interpretable tabular ML (no GPUs required). |

---

## 💻 Local Development

### 1. Backend (Spring Boot)
```bash
cd backend
# Set environment variables: DB_URL, JWT_SECRET, OLLAMA_API_KEY
mvn spring-boot:run
```
*Note: Flyway runs all database migrations (V1 to V10) automatically on startup.*

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### 3. ML Pipeline (Reproduce Evaluation)
```bash
cd ml
python generate_dataset.py   # Generates 10,000 synthetic transactions
python train_model.py        # Trains the model on a 70% split
python evaluate.py           # Evaluates on the 15% held-out test set
```

---

## 🧪 Comprehensive E2E Testing

Zoqel includes battle-tested integration scripts that run directly against the live backend:
- `phase5_isolation_test.py`: Asserts strictly scoped data reads and write-blocking for Demo Mode vs. Real Users (**19/19 Pass**).
- `phase6_full_test.py`: Full end-to-end pipeline test traversing the Webhook Parser, Risk Engine, LLM Agent, Policy Gate, and Audit Trail (**46/47 Pass**, 1 Warn for expected webhook signature bypass).

*For a detailed log of real bugs caught and fixed during development (including Idempotency double-retries and N+1 query storms), see [`docs/failure-analysis.md`](docs/failure-analysis.md).*

---
<div align="center">
  <i>Designed and developed for the Razorpay AI Buildathon 2026.</i>
</div>
