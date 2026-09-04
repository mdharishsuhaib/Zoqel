<div align="center">

# Zoqel AI

**Autonomous AI Payment Recovery Agent for Razorpay**

[![Backend](https://img.shields.io/badge/Backend-Spring_Boot_3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](#)
[![Frontend](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Database](https://img.shields.io/badge/Database-Supabase_Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![Hosting](https://img.shields.io/badge/Hosting-Render_&_Cloudflare-F6821F?style=for-the-badge&logo=cloudflare&logoColor=white)](#)

</div>

---

## Hackathon Submission

Built for the **Razorpay Buildathon** — an autonomous merchant-facing agent that answers the billion-dollar e-commerce question: *"How do we intelligently recover failed payments without alienating customers or burning engineering time on static retry loops?"*

Instead of a merchant relying on rigid, hardcoded cron jobs to retry failed payments, **Zoqel** acts as an autonomous financial agent. It intercepts failed transactions in real-time, evaluates the exact failure reason, cross-references the merchant's custom risk boundaries (e.g., maximum retry amounts, required confidence thresholds), and autonomously executes a recovery strategy.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Recovery Pipeline Reference](#recovery-pipeline-reference)
- [AI Agent Policy Reference](#ai-agent-policy-reference)
- [API Reference](#api-reference)

---

## Overview

Zoqel is an AI-powered control center that sits between a merchant's payment gateway and their customer base. 

Pipeline, end-to-end:
1. **Onboarding:** Merchant signs up, creates a workspace, and connects their Razorpay sandbox. They configure their AI Agent boundaries (max retries, autonomous recovery limits, confidence thresholds).
2. **Simulation / Real-time Monitoring:** A deterministic background simulator generates live, realistic failed transactions across different customers and failure reasons.
3. **AI Evaluation:** The moment a transaction fails, Zoqel's AI intercepts it. It evaluates the risk and the failure reason (e.g., Insufficient Funds vs. Network Error).
4. **Autonomous Execution:** If the recovery confidence exceeds the merchant's threshold, the agent executes the retry. If it falls below the threshold or hits a hard limit (e.g., 3 consecutive failures), it escalates the case to a human.
5. **Live Dashboarding:** The merchant watches a live-polling dashboard (15s intervals) that tracks Revenue at Risk, Recoverable Revenue, and an active queue of the AI's operations, completely isolated to their workspace.

---

## Key Features

- **Autonomous Policy Engine** — Merchants define exact boundaries (max_retries_per_transaction, min_recovery_confidence, max_auto_amount). The agent operates autonomously *only* within these boundaries, escalating anything outside them.
- **Deterministic Live Simulator** — No empty dashboards. A background engine continuously generates realistic Razorpay transaction data across multiple customers, allowing judges and users to see the AI agent react in real-time.
- **Resilient Real-Time Dashboard** — A live-polling dashboard (15s intervals with background refetching) that gracefully handles backend cold-starts with beautiful "Server waking up" / "Reconnecting..." UI states instead of breaking or showing fabricated data.
- **Strict Multi-Tenancy (Workspace Isolation)** — Built from the ground up for SaaS. Every transaction, customer, recovery case, and policy rule is strictly scoped to a specific workspace_id. User A can *never* see User B's recovery queues.
- **Immutable Audit Trail** — The AI agent's reasoning isn't a black box. Every decision, retry, escalation, and policy block is recorded in an immutable audit event log so merchants can see exactly *why* the AI took action.
- **Bulletproof Session Handling** — Demo accounts and real authenticated accounts are strictly segregated. Visiting a demo route will never silently hijack or destroy a real merchant's active session.

---

## System Architecture

Zoqel is designed as a highly resilient, decoupled system:

- **Frontend (Cloudflare Workers):** React 18 + Vite + Tailwind CSS. Hosted on the edge for zero latency. Handles JWT session management, multi-step onboarding, and background live-polling.
- **Backend (Render / Spring Boot 3):** A stateless Java Spring Boot API. Handles the heavy lifting: the deterministic simulator, the AI evaluation logic, transaction routing, and metric aggregation. Fully dockerized and memory-optimized for 512MB free-tier constraints.
- **Database (Supabase PostgreSQL):** The single source of truth. Handles relational data for workspaces, pp_users, 	ransactions, ecovery_cases, policy_rules, and udit_events. Row-level security is enforced via application-level workspace scoping.
- **Stateless & Idempotent:** Built to survive network drops. Workspace creation is idempotent, and API errors naturally propagate to the frontend to trigger retry UI flows rather than silently failing.

---

## Repository Structure

`	ext
zoqel/
├── backend/
│   ├── src/main/java/com/zoqel/
│   │   ├── agent/           # AI Gateway, LLM decision models, actions
│   │   ├── audit/           # Immutable event logging engine
│   │   ├── auth/            # JWT validation, Demo route guards
│   │   ├── dashboard/       # Aggregation queries for UI metrics & charts
│   │   ├── policy/          # Merchant-defined rules & constraints
│   │   ├── recovery/        # Recovery Case management (Pending/Resolved/Escalated)
│   │   ├── risk/            # Pre-LLM risk evaluation heuristics
│   │   ├── simulator/       # Deterministic background Razorpay simulator
│   │   ├── transaction/     # Core payment processing entities
│   │   └── workspace/       # Multi-tenant isolation context
│   ├── src/main/resources/
│   │   ├── db/migration/    # Flyway SQL schemas for Supabase
│   │   └── application.yml  # Spring Boot configuration
│   ├── Dockerfile           # Optimized multi-stage build (-Xmx256m)
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── app/             # React app shell & routing
    │   ├── components/      # UI primitives, charts, metrics, skeletons
    │   ├── features/        # Domain modules (overview, onboarding, auth)
    │   ├── services/        # API client bindings (axios)
    │   └── stores/          # Zustand state management
    ├── package.json
    └── vite.config.ts
`

---

## Prerequisites

- Node.js 18+ and 
pm for the frontend.
- Java 21+ and maven for the backend.
- A **Supabase** project (free tier is enough) — for Postgres.
- A long random string to use as your JWT_SECRET.

---

## Quick Start

Two processes, two terminals.

`ash
# Terminal 1 - Backend
cd backend
export DB_URL=jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require
export DB_USER=postgres.<your-project>
export DB_PASSWORD=<your-password>
export JWT_SECRET=<your-secret>
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
`

Open:
- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:8080/actuator/health

*Note: Before starting, make sure to execute the SQL migrations against your Supabase database.*

---

## Backend Setup

`ash
cd backend
`

Set your environment variables (can be done inline or placed in your OS environment):
`ash
DB_URL=jdbc:postgresql://...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=super_secret_key
PORT=8080
FRONTEND_URL=http://localhost:5173
`

Run the application:
`ash
mvn clean spring-boot:run
`
The backend is now live on port 8080.

---

## Frontend Setup

`ash
cd frontend
npm install
npm run dev
`

Create a .env file at the rontend/ root if you need to point to a deployed backend:
`env
VITE_API_BASE_URL=http://localhost:8080/api
`

---

## Recovery Pipeline Reference

The autonomous pipeline is triggered immediately when the RealTimeDataGenerator simulator creates a failed transaction.

1. **Simulate & Trigger** (TransactionService.simulate) — A realistic transaction fails. An Audit Event is instantly recorded.
2. **Risk Detection** (RiskDetectionService) — Evaluates the customer's history. Has this customer failed payments before? Is the amount unusually high? Assigns a Risk Score (0-100) and a Risk Tier.
3. **Policy Engine Check** (PolicyEngine) — Before the AI can act, the engine checks the merchant's hard boundaries for that specific workspace_id.
   * *Is the amount too high?* -> **BLOCKED**
   * *Have we retried too many times?* -> **BLOCKED**
4. **AI Gateway** (AgentGateway) — If the policy allows it, the transaction details are sent to the AI Agent. The agent returns a RecoveryAction (RETRY, ESCALATE, IGNORE) along with an explanation.
5. **Execution** — If the AI says RETRY, a new PaymentAttempt is logged. If it succeeds, the transaction is marked RECOVERED.

---

## AI Agent Policy Reference

The agent is constrained by strict rules stored in the policy_rules table, configured by the merchant during onboarding. 

| Policy Key | Enforcement | Consequence |
|---|---|---|
| max_auto_amount_paise | Hard Limit | If transaction amount > limit, AI is blocked; case escalates. |
| max_retries_per_transaction | Hard Limit | If attempt count > limit, AI is blocked; case escalates. |
| min_recovery_confidence | Soft Guardrail | If AI calculates success probability < limit, it will not retry. |
| equire_human_for_high_risk | Override | If Risk Score > 80, autonomous action is disabled. |

Every time a policy blocks an action, it is written to the immutable udit_events table so the merchant sees exactly *why* the AI didn't touch a high-value failed payment.

---

## API Reference

Base URL: http://localhost:8080 (local) — all /api/* endpoints require Authorization: Bearer <token>.

### GET /actuator/health
Plain liveness check for deployment platforms like Render.
`json
{ "status": "UP" }
`

### GET /api/dashboard/metrics
Aggregates live statistics for the authenticated user's workspace.
Returns: DashboardMetrics (Total analyzed, Revenue at risk, Recovery rate, Blocked actions).

### GET /api/dashboard/chart
Returns an array of the last 30 days of transaction volume mapped into At-Risk, Recoverable, and Recovered buckets for chart rendering.

### GET /api/transactions
Returns a paginated list of all transactions belonging to the current user's workspace. Accepts optional ?status= filter.

### GET /api/audit
Returns the immutable chronological feed of every action taken by the AI agent, the policy engine, or the simulator within the user's workspace.