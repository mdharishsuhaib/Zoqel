# Zoqel — System Architecture

## Overview

Zoqel is an AI-powered revenue recovery agent that detects failed payments, analyzes their
recoverability, executes bounded recovery actions through an AI agent + policy engine, and
measures the monetary outcome.

**The central architectural rule:**
> The LLM recommends. The deterministic system authorizes.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ZOQEL SYSTEM                            │
│                                                                 │
│  ┌──────────────┐        ┌──────────────────────────────────┐  │
│  │   Frontend   │◄──────►│           Backend API            │  │
│  │  React/TS    │ REST   │       Spring Boot 3.3 / Java 21  │  │
│  │  Tailwind    │        │                                  │  │
│  │  Recharts    │        │  ┌─────────────────────────────┐ │  │
│  └──────────────┘        │  │    Domain Layers             │ │  │
│                          │  │                             │ │  │
│  ┌──────────────┐        │  │  ┌──────────────────────┐  │ │  │
│  │  ML Service  │◄──────►│  │  │  Revenue Risk        │  │ │  │
│  │  Python 3.11 │  HTTP  │  │  │  Detector            │  │ │  │
│  │  scikit-learn│        │  │  └──────────┬───────────┘  │ │  │
│  └──────────────┘        │  │             │               │ │  │
│                          │  │  ┌──────────▼───────────┐  │ │  │
│  ┌──────────────┐        │  │  │  Recovery Prediction  │  │ │  │
│  │  PostgreSQL  │◄──────►│  │  │  Engine (heuristic)  │  │ │  │
│  │  Database    │  JDBC  │  │  └──────────┬───────────┘  │ │  │
│  └──────────────┘        │  │             │               │ │  │
│                          │  │  ┌──────────▼───────────┐  │ │  │
│  ┌──────────────┐        │  │  │  Zoqel AI Agent      │  │ │  │
│  │  OpenRouter  │◄───────┤  │  │  (GPT-4o via OpenR.) │  │ │  │
│  │  API (LLM)   │  HTTPS │  │  └──────────┬───────────┘  │ │  │
│  └──────────────┘        │  │             │ recommendation │ │  │
│                          │  │  ┌──────────▼───────────┐  │ │  │
│                          │  │  │  Policy Engine       │  │ │  │
│                          │  │  │  (deterministic)     │  │ │  │
│                          │  │  └──────────┬───────────┘  │ │  │
│                          │  │             │               │ │  │
│                          │  │  ┌──────────▼───────────┐  │ │  │
│                          │  │  │  Payment Simulator   │  │ │  │
│                          │  │  │  (deterministic)     │  │ │  │
│                          │  │  └──────────┬───────────┘  │ │  │
│                          │  │             │               │ │  │
│                          │  │  ┌──────────▼───────────┐  │ │  │
│                          │  │  │  Audit Trail         │  │ │  │
│                          │  │  │  (immutable log)     │  │ │  │
│                          │  │  └──────────────────────┘  │ │  │
│                          │  └─────────────────────────────┘ │  │
│                          └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Complete Recovery Workflow

```
1. SYNTHETIC PAYMENT EVENT
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/transactions/simulate                         │
   │ { customerId, amountPaise, failureReason, method }      │
   └────────────────────────┬────────────────────────────────┘
                            │ creates Transaction (status=FAILED)
                            │ creates PaymentAttempt #1 (FAILED)
                            ▼
2. RISK DETECTION
   ┌─────────────────────────────────────────────────────────┐
   │ GET /api/risk/{transactionId}                           │
   │ Rule-based scorer: failure reason + customer history    │
   │ → risk score 0-100, atRisk flag, primary reason         │
   │ → estimated recovery probability                        │
   └────────────────────────┬────────────────────────────────┘
                            │
                            ▼
3. RECOVERY ORCHESTRATION
   ┌─────────────────────────────────────────────────────────┐
   │ POST /api/recovery/process/{transactionId}              │
   │                                                         │
   │  a) Open RecoveryCase (status=IN_PROGRESS)              │
   │     → Audit: RECOVERY_CASE_OPENED                       │
   │                                                         │
   │  b) Compute recovery probability via RiskDetector       │
   │     → Audit: PROBABILITY_CALCULATED                     │
   │                                                         │
   │  c) Call AI Agent (OpenRouter/GPT-4o)                   │
   │     Input: structured AgentContext JSON                  │
   │     Output: { decision, reason, confidence,             │
   │              requires_human }                            │
   │     → Audit: AGENT_DECISION                             │
   │                                                         │
   │  d) Policy Engine validates recommendation              │
   │     → ALLOWED or BLOCKED                                │
   │     → Audit: POLICY_VALIDATED or POLICY_BLOCKED         │
   │                                                         │
   │  e) If ALLOWED: execute via PaymentSimulator            │
   │     Deterministic: seed + attempt → SUCCESS/FAILED      │
   │     Update transaction status                           │
   │     → Audit: ACTION_EXECUTED, OUTCOME_RECORDED          │
   │                                                         │
   │  f) If BLOCKED: ESCALATE or IGNORE                      │
   │     → Audit: HUMAN_ESCALATED                            │
   └────────────────────────┬────────────────────────────────┘
                            │
                            ▼
4. DASHBOARD METRICS
   ┌─────────────────────────────────────────────────────────┐
   │ GET /api/dashboard/metrics                              │
   │ → Revenue at Risk, Recovered, Recovery Rate             │
   │ → Counts: analyzed, candidates, executed, escalated     │
   └─────────────────────────────────────────────────────────┘
```

---

## Database Schema

```
customers
├── id (VARCHAR 36, PK)
├── name, email, phone
├── risk_tier (LOW/MEDIUM/HIGH)
└── joined_at, created_at, updated_at

transactions
├── id (VARCHAR 36, PK)
├── customer_id → customers.id
├── amount_paise (BIGINT — all amounts in paise)
├── status (PENDING/SUCCESS/FAILED/RECOVERED/IGNORED/ESCALATED)
├── failure_reason (BANK_TIMEOUT/NETWORK_ERROR/...)
├── payment_method (UPI/CARD/NETBANKING/WALLET)
├── simulator_seed (INT — deterministic outcome seed)
└── initiated_at, settled_at, created_at, updated_at

payment_attempts
├── id (BIGSERIAL, PK)
├── transaction_id → transactions.id
├── attempt_number (1=initial, 2=first retry, ...)
├── outcome (PENDING/SUCCESS/FAILED)
└── attempted_at, resolved_at

recovery_cases
├── id (VARCHAR 36, PK)
├── transaction_id → transactions.id (UNIQUE)
├── status (OPEN/IN_PROGRESS/RECOVERED/FAILED/ESCALATED/IGNORED)
├── retry_count
├── agent_decision, agent_reason, agent_confidence
├── policy_decision, policy_reason
├── recovery_probability
└── opened_at, closed_at, last_action_at

audit_events  (IMMUTABLE — no updates)
├── id (BIGSERIAL, PK)
├── transaction_id
├── recovery_case_id
├── event_type (RISK_DETECTED/AGENT_DECISION/POLICY_VALIDATED/...)
├── event_detail (text description)
└── occurred_at

policy_rules
├── id (BIGSERIAL, PK)
├── rule_key (UNIQUE)
├── rule_value
└── description
```

---

## Backend Package Structure

```
com.zoqel/
├── ZoqelApplication.java
├── config/
│   ├── WebConfig.java          (CORS)
│   └── OpenRouterConfig.java   (LLM client bean)
├── customer/
│   ├── Customer.java           (JPA entity)
│   ├── CustomerRepository.java
│   ├── CustomerHistory.java    (DTO)
│   ├── CustomerHistoryService.java
│   └── CustomerController.java
├── transaction/
│   ├── Transaction.java
│   ├── PaymentAttempt.java
│   ├── TransactionRepository.java
│   ├── PaymentAttemptRepository.java
│   ├── SimulateTransactionRequest.java (DTO)
│   ├── TransactionService.java
│   └── TransactionController.java
├── simulator/
│   ├── PaymentSimulator.java   (deterministic engine)
│   ├── SimulationRequest.java
│   ├── SimulationResult.java
│   └── SimulatorController.java
├── risk/
│   ├── RiskScore.java          (DTO)
│   ├── RiskDetectionService.java
│   └── RiskController.java
├── audit/
│   ├── AuditEvent.java
│   ├── AuditRepository.java
│   ├── AuditService.java
│   └── AuditController.java
├── policy/
│   ├── PolicyRule.java
│   ├── PolicyRepository.java
│   ├── PolicyDecision.java     (DTO)
│   ├── PolicyEngine.java
│   └── PolicyController.java
├── recovery/
│   ├── RecoveryCase.java
│   ├── RecoveryCaseRepository.java
│   ├── RecoveryCaseService.java  (main orchestrator — @Transactional)
│   └── RecoveryCaseController.java
├── agent/
│   ├── AgentDecision.java      (DTO)
│   ├── AgentContext.java       (DTO)
│   ├── AgentGateway.java       (interface)
│   ├── OpenRouterAgentGateway.java (concrete impl)
│   ├── AgentService.java
│   └── AgentController.java
└── dashboard/
    ├── DashboardMetrics.java   (DTO)
    └── DashboardController.java
```

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/actuator/health` | Health check |
| GET | `/api/dashboard/metrics` | Aggregated business metrics |
| GET | `/api/customers` | List customers (paginated) |
| GET | `/api/customers/{id}` | Get customer |
| GET | `/api/customers/{id}/history` | Customer payment history |
| GET | `/api/transactions` | List transactions (paginated, filterable) |
| GET | `/api/transactions/{id}` | Get transaction |
| POST | `/api/transactions/simulate` | Create synthetic failed transaction |
| POST | `/api/simulator/retry/{id}` | Execute retry via simulator |
| GET | `/api/risk/{transactionId}` | Get risk score |
| GET | `/api/recovery` | List recovery cases |
| GET | `/api/recovery/{id}` | Get recovery case |
| GET | `/api/recovery/transaction/{txnId}` | Get case by transaction |
| POST | `/api/recovery/process/{txnId}` | Run full recovery workflow |
| POST | `/api/agent/recommend/{txnId}` | Preview agent recommendation |
| GET | `/api/policy` | List policy rules |
| PUT | `/api/policy/{key}` | Update policy rule |
| GET | `/api/audit/{transactionId}` | Audit trail for transaction |
| GET | `/api/audit` | Recent audit events (paginated) |

---

## Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Backend | Java 21 + Spring Boot 3.3 | Mature, type-safe, excellent JPA/REST support |
| ORM | Spring Data JPA + Hibernate | Standard, production-proven |
| DB Migrations | Flyway | Reproducible schema management |
| Database | PostgreSQL 15 | Reliable, JSONB support for metadata |
| Frontend | React 18 + TypeScript | Component model + type safety |
| Build | Vite 5 | Fast dev server, ESM-native |
| Styling | Tailwind CSS 3 | Utility-first, no CSS files needed |
| Charts | Recharts | React-native charting |
| ML | scikit-learn + Python 3.11 | Fast, interpretable, no GPU needed |
| LLM | GPT-4o via OpenRouter | Strong reasoning, OpenAI-compatible API |
| Container | Docker + Compose | Reproducible full-stack deployment |

---

## Key Design Principles

1. **Amounts in paise**: All monetary values stored and computed as `Long` (paise = 1/100 INR). Display layer divides by 100. Zero floating-point errors.

2. **Deterministic simulator**: Each transaction has a `simulator_seed`. Outcomes are computed as `Random(seed + attempt * 31337L).nextDouble() < threshold`. Running the same transaction twice gives the same result.

3. **Immutable audit trail**: `audit_events` table has no UPDATE operations. Once written, an audit event is permanent.

4. **Policy engine is the gatekeeper**: No payment action (retry, escalate, notify) can bypass the policy engine. The LLM's recommendation is just a recommendation.

5. **Fallback on LLM failure**: If OpenRouter is unavailable, `OpenRouterAgentGateway` returns a safe deterministic fallback based on failure reason and recovery probability. The system continues to function.
