# Zoqel — Autonomous Revenue Recovery

![Zoqel Dashboard](https://raw.githubusercontent.com/mdharishsuhaib/Zoqel/master/frontend/public/logo.png)

Zoqel is an AI-powered revenue recovery intelligence layer designed to autonomously detect, diagnose, and recover failed payments before they result in churn. Built for the modern payment ecosystem (including gateways like Razorpay), Zoqel replaces static retry rules with a dynamic, LLM-driven decision pipeline.

**Built for the Razorpay Buildathon — Track 03: AI Revenue Recovery**

## 🚀 Features

*   **Autonomous Agent Pipeline (Detect → Diagnose → Decide → Recover):** Ingests webhook events from payment gateways, analyzes customer risk tiers and failure reasons, and triggers intelligent recovery strategies.
*   **Live Simulator:** An interactive, fully deterministic simulator that allows users to watch the AI agent process a payment failure, check bounded policies, and execute a recovery in real-time.
*   **Secure Authentication:** Complete registration and login system backed by a Spring Boot REST API and PostgreSQL database, featuring hashed passwords and secure sessions.
*   **Actionable Dashboard:** Real-time visibility into recovered revenue, success rates, recovery queues, and human escalation requirements.
*   **Robust Bounded Policies:** Hard limits on transaction amounts, retry counts, and AI confidence thresholds ensure the autonomous agent never goes rogue.

## 🏗️ Architecture Stack

This project is designed for a modern, scalable cloud deployment:

*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, Zustand (State Management). Deployed via **Cloudflare Pages**.
*   **Backend:** Java 21, Spring Boot 3.3.2, Spring Data JPA, Flyway (Migrations). Deployed via **Render**.
*   **Database:** PostgreSQL 15. Hosted on **Supabase**.
*   **AI Layer:** Ollama Cloud API (gpt-oss:120b-cloud) for intelligent transaction diagnosis.

## 🛠️ Local Development Setup

To run Zoqel locally, you need Node.js, Java 21, and PostgreSQL (or a Supabase connection string).

### 1. Database (Supabase or Local)
If using Supabase, obtain your PostgreSQL connection string from the Supabase dashboard. 
Set the environment variable:
```bash
export DB_URL="jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?user=postgres&password=your_password"
```

### 2. Backend (Spring Boot)
Navigate to the `backend` directory and start the server:
```bash
cd backend
mvn spring-boot:run
```
*Note: Flyway will automatically run all SQL migrations (including creating the `app_users` table) on startup.*

### 3. Frontend (React)
Navigate to the `frontend` directory, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

## 🔒 Authentication & Database (Option B / Supabase)

Zoqel's backend manages users directly. When connected to a Supabase PostgreSQL database, Flyway automatically runs the `V5__create_users_table.sql` migration to create the `app_users` table in your public schema. Passwords are cryptographically hashed before storage.

## 📄 License
MIT License
