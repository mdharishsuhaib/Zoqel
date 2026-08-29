# Zoqel: Production Roadmap

This document outlines the architectural roadmap for transitioning Zoqel from a stable **Hackathon Prototype (Track 03 focus)** to an enterprise-grade, production-ready SaaS platform. 

To ensure stability for the hackathon evaluation, we intentionally isolated our scope to the core **AI Revenue Recovery Pipeline** (Phase 0). Phases A through E represent the post-hackathon scaling architecture.

## Legend
* ✅ **Implemented** (Hackathon Scope)
* 🟡 **Planned** (Post-Hackathon Scope)
* 🔴 **Explicitly Excluded** (Not required for our domain)

---

## Phase 0 — Hackathon Stability (Current State)
Our primary objective for the Razorpay Buildathon was proving the viability of a deterministic-gated AI recovery pipeline.
* ✅ End-to-end AI Revenue Recovery Pipeline (Detect → Diagnose → Decide → Recover)
* ✅ Policy-Bounded Guardrails (Strict merchant limits on AI actions)
* ✅ Multi-tenant Workspace Isolation (19/19 passing isolation tests)
* ✅ Secure Webhook parsing and execution
* ✅ BCrypt password hashing and JWT-based session handling
* ✅ Immutable Audit Log for all financial pipeline events

---

## Phase A — Production Authentication
* 🟡 **Email Verification (OTP):** Implement an SMTP-backed OTP flow required before account activation.
* 🟡 **Password Recovery:** Secure "Forgot Password" flow with time-bound reset links.
* 🟡 **Account States:** Introduce explicit state machines (PENDING_VERIFICATION, ACTIVE, SUSPENDED, LOCKED).
* 🟡 **Terms & Privacy Versioning:** Store accepted legal document versions and timestamps in the database.

---

## Phase B — Security Hardening
* 🟡 **Rate Limiting (Redis):** Implement strict throttling on login and OTP generation endpoints to prevent brute forcing.
* 🟡 **Session Invalidation:** Revoke active JWTs upon password reset or security-critical events.
* 🟡 **Cryptographic Webhook Validation:** Enforce HMAC signature verification on all incoming Razorpay webhooks (bypassed in Phase 0 for demo simplicity).
* 🟡 **Authentication Audit Logs:** Expand the existing pipeline audit trail to track LOGIN_FAILED, PASSWORD_CHANGED, etc.

---

## Phase C — Business Onboarding
Instead of full consumer KYC, Zoqel requires B2B merchant context to inform the AI model.
* 🟡 **Business Profile:** Collect Business Name, Industry, Website, Country, and Currency.
* 🟡 **Payment Provider Selection:** Connect real Razorpay, Stripe, or PayPal credentials.
* 🔴 **Consumer KYC:** (Aadhaar, PAN, Video KYC, DigiLocker). *Explicitly excluded as Zoqel is a B2B intelligence layer, not a payment gateway or bank.*

---

## Phase D — Zoqel Compliance & Auditability
* 🟡 **Expanded Policy Engine:** Add complex, multi-variable policy rules (e.g., "Max retries based on risk-tier").
* 🟡 **Granular RBAC:** Role-based access control allowing "Analysts" to view dashboards but restricting "Admins" to policy changes.

---

## Phase E — Production Infrastructure
* 🟡 **Message Queues:** Transition from synchronous webhook processing to an async Kafka/RabbitMQ queue for extreme high-throughput resilience.
* 🟡 **Caching Layer:** Implement Redis for rapid lookup of active workspace policies during high-volume failure events.
