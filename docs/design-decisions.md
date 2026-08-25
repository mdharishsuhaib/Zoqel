# Zoqel — Design Decisions

This document explains the key technical decisions made during Zoqel's development
and the rationale behind each choice.

---

## 1. The LLM Recommends. The Deterministic System Authorizes.

**Decision**: The AI agent produces a structured JSON recommendation that always passes
through a deterministic Policy Engine before any action is taken. The LLM never directly
executes a payment action.

**Rationale**:
- LLMs can hallucinate, over-retry, or produce unexpected outputs
- Financial systems require predictable, auditable behavior
- A rule-based policy engine guarantees invariants (e.g., never retry more than N times)
- This architecture makes Zoqel defensible: if something goes wrong, the policy engine's
  decision log shows exactly what was permitted and why

**Alternative considered**: Giving the LLM tool access to retry payments directly.
This was rejected because it makes the system unpredictable and the LLM becomes a
financial executor — which is exactly what we want to avoid.

---

## 2. Amounts Stored in Paise (Integer)

**Decision**: All monetary values (transaction amounts, recovery metrics, thresholds) are
stored and computed as `Long` integers representing paise (1 INR = 100 paise).
The display layer divides by 100 for rendering.

**Rationale**:
- Floating-point arithmetic is not suitable for financial calculations
  (e.g., `0.1 + 0.2 ≠ 0.3` in IEEE 754)
- Integer paise arithmetic is exact: `₹499.99 = 49999 paise`
- Prevents subtle rounding bugs that could produce incorrect ₹ recovery totals

**Impact**: Every API response uses `amountPaise` / `revenueRecoveredPaise` etc.
Frontend divides by 100 with `formatRupees(paise)`.

---

## 3. Deterministic Payment Simulator with Seeds

**Decision**: Each synthetic transaction has a `simulator_seed` (INT) stored at creation.
The PaymentSimulator computes outcomes using `new Random(seed + attemptNumber * 31337L)`.

**Rationale**:
- Makes demos fully reproducible: the same transaction always produces the same outcome
- Allows the test dataset to be regenerated with identical outcomes
- Prevents the demo from having "lucky" or "unlucky" runs
- The seed is chosen at transaction creation and never changes

**Outcome thresholds** (match between Java simulator and Python dataset generator):
```
BANK_TIMEOUT:       80% success on retry
NETWORK_ERROR:      75% success
INSUFFICIENT_FUNDS:  5% success (deliberately low — shouldn't retry)
EXPIRED_CARD:       10% success
DUPLICATE_ATTEMPT:   0% (always blocked by policy anyway)
REPEATED_FAILURE:   15% success
UNKNOWN:            30% success
```

---

## 4. Immutable Audit Trail

**Decision**: `audit_events` table has no UPDATE or DELETE operations.
`AuditService.record()` only ever INSERTs.

**Rationale**:
- Auditing only makes sense if the log cannot be retroactively altered
- A reviewer should be able to reconstruct exactly what Zoqel did and why
- This is critical for Razorpay's "auditable record of actions" requirement

**Implementation detail**: The `AuditEvent` JPA entity intentionally has no `@PreUpdate`
lifecycle method. If an update is attempted, it would throw an exception.

---

## 5. Structured Agent Context (Not Raw DB Access)

**Decision**: The AI agent receives a carefully constructed `AgentContext` JSON object,
not raw database access or unfiltered transaction records.

```json
{
  "transactionId": "TXN-000123",
  "amountPaise": 499900,
  "failureReason": "BANK_TIMEOUT",
  "previousSuccessfulPayments": 8,
  "previousFailures": 0,
  "successRate": 1.0,
  "recoveryProbability": 0.80,
  "riskScore": 87
}
```

**Rationale**:
- Limits the agent's information surface to exactly what it needs
- Prevents prompt injection via database content
- Keeps token usage minimal and consistent
- Makes the agent's reasoning auditable (input is always known)

---

## 6. Gradient-Boosted Trees (Not Deep Learning)

**Decision**: The recovery prediction ML model uses `HistGradientBoostingClassifier`
from scikit-learn, not a neural network or LLM-based classifier.

**Rationale**:
- This is a tabular classification problem with ~10 features
- Gradient-boosted trees are state-of-the-art for tabular data
- No GPU required → runs on any development machine
- Feature importances are directly available and interpretable
- Training takes seconds, not hours
- The model is small enough to include in the repository

**Features used**:
- `failure_reason` (most important — categorical)
- `prev_successful_payments`, `prev_failures`, `success_rate`
- `amount_paise`, `amount_tier`
- `customer_age_days`, `days_since_last_success`
- `hour_of_day`, `day_of_week`

---

## 7. OpenRouter as LLM Provider

**Decision**: Use OpenRouter as the LLM API provider with GPT-4o as the target model.

**Rationale**:
- OpenRouter provides a unified API that is OpenAI-compatible
- The model can be switched by changing a single environment variable (`OPENROUTER_MODEL`)
- GPT-4o has strong instruction-following for structured JSON output
- The `AgentGateway` interface means swapping providers requires only a new implementation

**Fallback**: If OpenRouter is unavailable (no API key, network error, rate limit),
`OpenRouterAgentGateway` returns a deterministic fallback decision based on failure reason
and recovery probability. Zoqel continues to function safely without the LLM.

---

## 8. Single Orchestration Method (`RecoveryCaseService.process()`)

**Decision**: The entire recovery workflow (open case → assess risk → call agent →
check policy → execute → record) is a single `@Transactional` method in
`RecoveryCaseService.process()`.

**Rationale**:
- Keeps the workflow in one place — easy to read, debug, and test
- `@Transactional` ensures the database is always in a consistent state
  (if the simulator call fails, the recovery case doesn't get partially updated)
- Avoids distributed saga patterns that would complicate Stage 1

**Trade-off**: This is not a microservice architecture. That's intentional for Stage 1.
The workflow can be broken into async steps in later stages if needed.

---

## 9. Policy Rules in Database (Not Hardcoded)

**Decision**: Policy rule values (max retries, min confidence, max amount) are stored
in the `policy_rules` table and loaded at evaluation time.

**Rationale**:
- Rules can be updated at runtime without redeploying the backend
- The `PUT /api/policy/{key}` endpoint allows live adjustments for demos
- Different merchants might want different policy configurations
- The initial values are seeded via Flyway `V2__seed_policy_rules.sql`

---

## 10. No Real Payment Gateway

**Decision**: Zoqel never calls a real payment gateway. The `PaymentSimulator` is
entirely self-contained and deterministic.

**Rationale**:
- Makes the system safe to demonstrate publicly
- Ensures reproducible evaluation (same seed = same outcome)
- Eliminates network dependencies in tests
- Is fully compliant with the Razorpay track requirement
  (they explicitly want a demonstration of the recovery workflow, not real charging)
