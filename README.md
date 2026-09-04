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
- [Running Locally](#running-locally)
- [Production Deployment](#production-deployment)
- [Tech Stack](#tech-stack)

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
- **Backend (Render / Spring Boot 3):** A stateless Java Spring Boot API. Handles the heavy lifting: the deterministic simulator, the AI evaluation logic, transaction routing, and metric aggregation. Fully dockerized and optimized for 512MB free-tier constraints.
- **Database (Supabase PostgreSQL):** The single source of truth. Handles relational data for workspaces, pp_users, 	ransactions, ecovery_cases, policy_rules, and udit_events.
- **Stateless & Idempotent:** Built to survive network drops. Workspace creation is idempotent, and API errors naturally propagate to the frontend to trigger retry UI flows rather than silently failing.

---

## Running Locally

### Prerequisites
- Node.js 18+
- Java 21+
- Maven
- A Supabase project (PostgreSQL)

### 1. Database Setup
Execute the SQL schemas found in ackend/src/main/resources/db/migration against your Supabase SQL editor to create the tables.

### 2. Backend Setup
\\\ash
cd backend
export DB_URL=jdbc:postgresql://<SUPABASE_HOST>:5432/postgres?sslmode=require
export DB_USER=postgres.<your-project>
export DB_PASSWORD=<your-password>
export JWT_SECRET=<your-secret>
mvn spring-boot:run
\\\

### 3. Frontend Setup
\\\ash
cd frontend
npm install
npm run dev
\\\

---

## Production Deployment

Zoqel is currently optimized for a decoupled free-tier architecture:
1. **Database:** Supabase (Always Free)
2. **Backend:** Render (Docker Web Service, Free Tier)
3. **Frontend:** Cloudflare Workers (Free Tier)

*Note: The backend Dockerfile is memory-optimized (-Xmx256m) specifically to prevent Out-Of-Memory (OOM) crashes on 512MB free-tier platforms.*
