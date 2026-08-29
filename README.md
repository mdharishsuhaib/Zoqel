# Zoqel — Autonomous Revenue Recovery

**Built for the Razorpay Buildathon — Track 03: AI Revenue Recovery**

Zoqel is an AI-powered revenue recovery intelligence layer that autonomously detects, diagnoses, and recovers failed payments. It replaces static retry rules with a deterministic-gated LLM decision pipeline:

```text
Razorpay Webhook / Simulator
      ↓
Risk Detection (score 0–100)
      ↓
Recovery Probability (ML model, held-out test set)
      ↓
LLM Agent Decision (natural-language reasoning, confidence score)
      ↓
Policy Engine Gate  —→ "The LLM recommends. The policy authorises."
      ↓
Payment Simulator / Recovery Action
      ↓
Immutable Audit Log & Dashboard
```

Every money action is explainable, bounded, and gated. No recovery fires without a policy-cleared confidence score.

---

## Measured Results (Held-Out Test Set)

> These numbers come from `evaluation/report.txt`. The test set was never seen during training.

| Metric | Value |
|---|---|
| Revenue at Risk | ₹1.40 crore |
| Truly Recoverable | ₹60.16 lakh |
| **Revenue Recovered** | **₹53.97 lakh** |
| Recovery Rate | **89.7%** |
| Precision | 0.736 |
| Recall | 0.907 |
| F1 | 0.813 |
| AUC-ROC | 0.876 |
| False Intervention Cost | ₹17.18 lakh (reported, not hidden) |

**Per-failure-reason breakdown** — the model's zero recall on EXPIRED_CARD, INSUFFICIENT_FUNDS, REPEATED_FAILURE, and DUPLICATE_ATTEMPT is intentional: these classes have near-zero true recovery probability (0–14% by domain design). Predicting "don't intervene" on structurally unrecoverable failures is correct behaviour, not a miss. Full breakdown in [`evaluation/report.txt`](evaluation/report.txt).

See [`docs/evaluation.md`](docs/evaluation.md) for methodology, train/val/test split details, and how to reproduce results.

---

## Webhooks & Security Guards (Track 01 & 02 Alignment)

**1. Secure Webhook Integration (Track 01)**
Zoqel provides an active Razorpay webhook integration (`POST /api/v1/webhooks/razorpay`) that parses `payment.failed` payloads and immediately triggers the Recovery Pipeline. 
- *Note:* HMAC signature validation is bypassed for the hackathon scope. However, our architecture restricts the "blast radius" to running the AI pipeline without mutating balances or bypassing policy gates.

**2. Demo Mode Isolation (Track 02)**
Zoqel includes a production-grade demo mode backed by the real backend — not static mock data:
- `POST /api/auth/demo` issues a short-lived JWT scoped exclusively to `demo-workspace`
- `DemoGuardFilter` blocks all write operations (PUT/POST/DELETE) at the HTTP layer for demo tokens.
- **Webhook Abuse Protection:** Unauthenticated webhook payloads targeting the `demo-workspace` are hard-blocked (`403 Forbidden`), and payloads lacking a workspace ID are rejected (`400 Bad Request`), preventing malicious dashboard flooding.
- **19/19 negative isolation tests pass** against the live Render deployment.

See [`docs/failure-analysis.md`](docs/failure-analysis.md) for real bugs documented during development (idempotency double-retry, N+1 query storm, LLM markdown parsing, int overflow, Flyway restart, CORS).

---

## Comprehensive E2E Testing

The repository includes extensive integration tests that run directly against the live backend:
- `phase5_isolation_test.py`: Asserts strictly scoped data reads and write-blocking for Demo Mode vs. Real Users (19/19 Pass).
- `phase6_full_test.py`: Full end-to-end pipeline test traversing the Webhook Parser, Risk Engine, LLM Agent, Policy Gate, and Audit Trail (46/47 Pass, 1 Warn for webhook signature).

---

## Live Demo

- **Frontend**: https://zoqel.mdharishsuhaib.workers.dev
- **Backend API**: https://zoqel-8ly3.onrender.com/api
- **Demo entry**: Navigate to `/demo` — the app fetches a real backend token scoped to the demo workspace. No signup required.

> **Note:** Render free tier cold-starts in ~90 seconds after inactivity. The RealTimeDataGenerator runs continuously post-boot, creating synthetic failed transactions every ~10 seconds so the dashboard is always populated with fresh data.

---

## Architecture Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), TypeScript, Tailwind CSS, Framer Motion |
| Backend | Java 21, Spring Boot 3.3, Spring Data JPA, Flyway |
| Database | PostgreSQL 15 (Supabase) |
| AI Layer | Ollama Cloud API (gpt-oss:120b-cloud) |
| ML Pipeline | Python, scikit-learn, joblib (see `ml/`) |
| Frontend Deploy | Cloudflare Workers (Static Assets) |
| Backend Deploy | Render |

---

## Local Development

### Backend (Spring Boot)
```bash
cd backend
# Set environment variables: DB_URL, JWT_SECRET, OLLAMA_API_KEY
mvn spring-boot:run
# Flyway runs all migrations automatically on startup
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

### ML Pipeline (reproduce evaluation)
```bash
cd ml
python generate_dataset.py   # generates 10,000 synthetic transactions
python train_model.py        # trains on 70% split
python evaluate.py           # evaluates on held-out 15% test set
# Results written to evaluation/report.txt and evaluation/results.json
```

---

## License

MIT
