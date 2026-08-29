"""
Phase 6 — Comprehensive Endpoint Test Suite
Covers the full validation matrix from the user's checklist.
Run: python phase6_full_test.py
"""
import json, time, sys, hashlib, hmac, urllib.request, urllib.error

BASE = "https://zoqel-8ly3.onrender.com/api"
PASS = []
FAIL = []
WARN = []


def req(method, path, token=None, body=None, headers_extra=None, timeout=30):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if headers_extra:
        headers.update(headers_extra)
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            try:
                return resp.status, json.loads(resp.read())
            except Exception:
                return resp.status, {}
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {}
    except Exception as ex:
        return 0, str(ex)


def check(label, code, expected_codes, detail="", warn=False):
    ok = code in expected_codes
    symbol = "PASS" if ok else ("WARN" if warn else "FAIL")
    print(f"  [{symbol}] {label}: HTTP {code}  {detail}")
    if ok:
        PASS.append(label)
    elif warn:
        WARN.append(label)
    else:
        FAIL.append(label)
    return ok


def section(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")


# ─── SETUP ────────────────────────────────────────────────────────────────────
section("SETUP: Create two real users + demo token")
ts = str(int(time.time()))

code, d = req("POST", "/auth/register", body={"fullName": "Test A", "email": f"ta_{ts}@z.local", "password": "pw123"})
assert str(code).startswith("2"), f"Register A failed: {code}"
tokenA = d["token"]
req("POST", "/workspaces", token=tokenA, body={"name": "Workspace A", "businessType": "SaaS"})
for k, v in [("max_auto_amount_paise","2000000"),("min_recovery_confidence","0.65"),
              ("max_retries_per_transaction","3"),("require_human_for_repeated_failure","false"),
              ("auto_recovery_enabled","true")]:
    req("PUT", f"/policy/{k}", token=tokenA, body={"value": v})

code, d = req("POST", "/auth/register", body={"fullName": "Test B", "email": f"tb_{ts}@z.local", "password": "pw123"})
assert str(code).startswith("2"), f"Register B failed: {code}"
tokenB = d["token"]
req("POST", "/workspaces", token=tokenB, body={"name": "Workspace B", "businessType": "Ecom"})

code, d = req("POST", "/auth/demo")
assert str(code).startswith("2"), f"Demo token failed: {code}"
tokenD = d["token"]
print(f"  User A, B: registered | Demo: workspaceId={d.get('workspaceId')} demoMode={d.get('demoMode')}")


# ─── SECTION 1: AUTHENTICATION ────────────────────────────────────────────────
section("1. Authentication & Identity")

# POST /auth/demo idempotent
code, d2 = req("POST", "/auth/demo")
check("POST /auth/demo idempotent workspaceId", 200 if d2.get("workspaceId") == "demo-workspace" else 400, [200])
check("POST /auth/demo always demoMode=true", 200 if d2.get("demoMode") is True else 400, [200])

# Reserved email
code, _ = req("POST", "/auth/register", body={"fullName": "X", "email": "demo@zoqel.internal", "password": "x"})
check("Register demo@zoqel.internal -> 403", code, [403])
code, _ = req("POST", "/auth/login", body={"email": "demo@zoqel.internal", "password": "anything"})
check("Login demo@zoqel.internal -> 403", code, [403])

# Tampered JWT
code, _ = req("GET", "/workspaces/me", token="eyJhbGciOiJIUzI1NiJ9.TAMPERED.SIGNATURE")
check("Tampered JWT -> 401", code, [401])

# Duplicate registration
code, _ = req("POST", "/auth/register", body={"fullName": "X", "email": f"ta_{ts}@z.local", "password": "x"})
check("Duplicate register -> 409", code, [409])


# ─── SECTION 2: CUSTOMERS ─────────────────────────────────────────────────────
section("2. Customers")

code, cust = req("POST", "/customers", token=tokenA, body={"name": "Alice Sharma", "email": f"alice_{ts}@x.com", "phone": "9999"})
check("POST /customers -> 200", code, [200, 201], f"id={cust.get('id','?')[:8]}...")
cust_id = cust.get("id")

code, cust_get = req("GET", f"/customers/{cust_id}", token=tokenA)
check("GET /customers/{id} -> 200", code, [200], f"name={cust_get.get('name')}")

code, history = req("GET", f"/customers/{cust_id}/history", token=tokenA)
check("GET /customers/{id}/history -> 200", code, [200])

# User B cannot access User A's customer
code, _ = req("GET", f"/customers/{cust_id}", token=tokenB)
check("User B GET User A customer -> 404", code, [404])


# ─── SECTION 3: TRANSACTIONS ──────────────────────────────────────────────────
section("3. Transactions")

code, tx = req("POST", "/transactions/simulate", token=tokenA, body={
    "customerId": cust_id, "amountPaise": 750000, "failureReason": "NETWORK_ERROR", "paymentMethod": "UPI"
})
check("POST /transactions/simulate -> 200", code, [200, 201], f"status={tx.get('status')}")
tx_id = tx.get("id")
assert tx_id, "No transaction ID returned"

code, tx_get = req("GET", f"/transactions/{tx_id}", token=tokenA)
check("GET /transactions/{id} -> 200", code, [200], f"status={tx_get.get('status')}")
check("Transaction status is FAILED", 200 if tx_get.get("status") == "FAILED" else 400, [200])

# Pagination
code, page = req("GET", "/transactions?page=0&size=5", token=tokenA)
check("GET /transactions paginated -> 200", code, [200], f"totalElements={page.get('totalElements',0)}")

# Status filter
code, filtered = req("GET", "/transactions?status=FAILED", token=tokenA)
check("GET /transactions?status=FAILED -> 200", code, [200])

# Cross-tenant
code, _ = req("GET", f"/transactions/{tx_id}", token=tokenB)
check("User B GET User A transaction -> 404", code, [404])


# ─── SECTION 4: RISK SCORING ──────────────────────────────────────────────────
section("4. Risk Scoring")

code, risk = req("GET", f"/risk/{tx_id}", token=tokenA)
check("GET /risk/{id} -> 200", code, [200], f"score={risk.get('score')} atRisk={risk.get('atRisk')}")
if code == 200:
    score = risk.get("score", 0)
    check("Risk score is 0-100", 200 if 0 <= score <= 100 else 400, [200], f"score={score}")
    check("NETWORK_ERROR is atRisk=true", 200 if risk.get("atRisk") else 400, [200])


# ─── SECTION 5: FULL RECOVERY PIPELINE ───────────────────────────────────────
section("5. Full Recovery Pipeline")

code, rc = req("POST", f"/recovery/process/{tx_id}", token=tokenA)
check("POST /recovery/process/{id} -> 200", code, [200, 201],
      f"status={rc.get('status')} decision={rc.get('agentDecision')}")
rc_id = rc.get("id")
final_status = rc.get("status")

# IDEMPOTENCY — call process twice on same transaction (Failure 001 re-test)
code, rc2 = req("POST", f"/recovery/process/{tx_id}", token=tokenA)
already_closed = rc2.get("status") in ["RECOVERED", "ESCALATED", "FAILED", "IGNORED"]
second_retry_count = rc2.get("retryCount", 999)
check("Idempotency: 2nd /recovery/process does not double-retry", 
      200 if already_closed and second_retry_count <= 1 else 400, [200],
      f"status={rc2.get('status')} retryCount={second_retry_count}")

# GET /recovery cases
code, rc_list = req("GET", "/recovery", token=tokenA)
check("GET /recovery list -> 200", code, [200])
if code == 200:
    content = rc_list.get("content", [])
    check("Recovery list not empty after process", 200 if len(content) > 0 else 400, [200],
          f"count={len(content)}")

# GET by ID
if rc_id:
    code, rc_get = req("GET", f"/recovery/{rc_id}", token=tokenA)
    check("GET /recovery/{id} -> 200", code, [200])

    code, rc_by_tx = req("GET", f"/recovery/transaction/{tx_id}", token=tokenA)
    check("GET /recovery/transaction/{txId} -> 200", code, [200])

    # Cross-tenant
    code, _ = req("GET", f"/recovery/{rc_id}", token=tokenB)
    check("User B GET User A recovery case -> 404", code, [404])


# ─── SECTION 6: SIMULATOR RETRY (DIRECT) ─────────────────────────────────────
section("6. Simulator Direct Retry")

# Create a fresh transaction specifically for direct simulator retry
code, tx2 = req("POST", "/transactions/simulate", token=tokenA, body={
    "customerId": cust_id, "amountPaise": 50000, "failureReason": "BANK_TIMEOUT", "paymentMethod": "CARD"
})
tx2_id = tx2.get("id")
if tx2_id:
    code, sim1 = req("POST", f"/simulator/retry/{tx2_id}", token=tokenA)
    check("POST /simulator/retry/{id} -> 200", code, [200], f"outcome={sim1.get('outcome','?') if isinstance(sim1,dict) else '?'}")

    # Determinism: simulate again with same txn (next attempt number)
    code, sim2 = req("POST", f"/simulator/retry/{tx2_id}", token=tokenA)
    # Can't guarantee same outcome (different attempt number), but must be 200
    check("POST /simulator/retry 2nd call -> 200", code, [200])


# ─── SECTION 7: AGENT ENDPOINT ────────────────────────────────────────────────
section("7. Agent Recommendation (no side effects)")

code, agent = req("POST", f"/agent/recommend/{tx_id}", token=tokenA)
check("POST /agent/recommend/{id} -> 200", code, [200, 202],
      f"action={agent.get('action','?') if isinstance(agent,dict) else '?'}")


# ─── SECTION 8: POLICY ENGINE ─────────────────────────────────────────────────
section("8. Policy Engine")

code, policies = req("GET", "/policy", token=tokenA)
check("GET /policy -> 200", code, [200])

# Update a policy
code, updated = req("PUT", "/policy/max_auto_amount_paise", token=tokenA, body={"value": "500"})
check("PUT /policy/{key} -> 200", code, [200])

# Verify a HIGH-value transaction gets BLOCKED by the new tight policy
code, tx_big = req("POST", "/transactions/simulate", token=tokenA, body={
    "customerId": cust_id, "amountPaise": 100000, "failureReason": "NETWORK_ERROR", "paymentMethod": "UPI"
})
if tx_big.get("id"):
    code, rc_big = req("POST", f"/recovery/process/{tx_big['id']}", token=tokenA)
    blocked = rc_big.get("status") in ["ESCALATED", "IGNORED", "FAILED"]
    check("Policy gate: Rs.1000 tx blocked when max_auto=Rs.5", 
          200 if blocked else 400, [200],
          f"status={rc_big.get('status')} (policy says max 500 paise = Rs.5)")

# Reset policy to sane value
req("PUT", "/policy/max_auto_amount_paise", token=tokenA, body={"value": "2000000"})


# ─── SECTION 9: AUDIT TRAIL ───────────────────────────────────────────────────
section("9. Audit Trail (immutability + coverage)")

time.sleep(1)
code, audit_page = req("GET", "/audit?size=50", token=tokenA)
check("GET /audit -> 200", code, [200])
if code == 200:
    events = audit_page.get("content", [])
    tx_events = [e for e in events if e.get("transactionId") == tx_id]
    check("Audit has events for processed transaction", 200 if len(tx_events) >= 3 else 400, [200],
          f"found {len(tx_events)} events for tx {tx_id[:8]}...")
    
    expected_types = {"RISK_DETECTED", "RECOVERY_CASE_OPENED", "AGENT_DECISION", "POLICY_VALIDATED", "ACTION_EXECUTED"}
    found_types = {e.get("eventType") for e in tx_events}
    coverage = expected_types & found_types
    check("Audit covers pipeline stages", 200 if len(coverage) >= 3 else 400, [200],
          f"found: {', '.join(sorted(coverage))}")

    # Cross-tenant: User B should not see User A's events
    code2, audit_b = req("GET", "/audit?size=100", token=tokenB)
    events_b = audit_b.get("content", []) if isinstance(audit_b, dict) else []
    leaked = [e for e in events_b if e.get("transactionId") == tx_id]
    check("User B audit has 0 User A events", 200 if not leaked else 403, [200],
          f"leaked={len(leaked)}")


# ─── SECTION 10: DASHBOARD ────────────────────────────────────────────────────
section("10. Dashboard Metrics")

code, m = req("GET", "/dashboard/metrics", token=tokenA)
check("GET /dashboard/metrics -> 200", code, [200])
if code == 200:
    at_risk = m.get("revenueAtRiskPaise", 0)
    recovered = m.get("revenueRecoveredPaise", 0)
    rate = m.get("recoveryRate", -1)
    check("revenueAtRisk >= revenueRecovered", 200 if at_risk >= recovered else 400, [200],
          f"atRisk={at_risk} recovered={recovered}")
    check("recoveryRate is 0-100", 200 if 0 <= rate <= 100 else 400, [200], f"rate={rate:.1f}%")
    check("User A dashboard non-zero (has transactions)", 200 if at_risk > 0 else 400, [200])

# User B sees only their own (zero) metrics
code, m_b = req("GET", "/dashboard/metrics", token=tokenB)
check("User B dashboard zero revenue (no transactions)", 
      200 if m_b.get("revenueAtRiskPaise", -1) == 0 else 403, [200])


# ─── SECTION 11: WEBHOOK ENDPOINT ────────────────────────────────────────────
section("11. Razorpay Webhook Endpoint")

# Build a Razorpay-style payment.failed payload
webhook_payload = {
    "entity": "event",
    "event": "payment.failed",
    "payload": {
        "payment": {
            "entity": {
                "id": f"pay_test_{ts}",
                "amount": 750000,
                "currency": "INR",
                "status": "failed",
                "method": "upi",
                "error_code": "BAD_REQUEST_ERROR",
                "error_description": "Payment processing failed",
                "error_reason": "payment_failed"
            }
        }
    }
}
payload_bytes = json.dumps(webhook_payload).encode()

# Compute HMAC-SHA256 signature (Razorpay format: HMAC of raw body with webhook secret)
# For the hackathon, the endpoint doesn't verify — we test with a plausible signature
webhook_secret = "test_webhook_secret"
sig = hmac.new(webhook_secret.encode(), payload_bytes, hashlib.sha256).hexdigest()

code, w = req("POST", "/v1/webhooks/razorpay", body=webhook_payload)
check("POST /webhooks/razorpay missing workspaceId -> 400", code, [400])

webhook_payload["payload"]["payment"]["entity"]["notes"] = {"workspaceId": "demo-workspace"}
code, w2 = req("POST", "/v1/webhooks/razorpay", body=webhook_payload)
check("POST /webhooks/razorpay demo-workspace blocked -> 403", code, [403])

# Document the known gap explicitly
print()
print("  [WARN] Webhook signature verification is bypassed for the hackathon (assumed authenticated by API gateway)")
WARN.append("Webhook signature verification not implemented")


# ─── SECTION 12: DEMO MODE ISOLATION (regression) ────────────────────────────
section("12. Demo Mode Isolation (regression check)")

code, _ = req("PUT", "/policy/max_auto_amount_paise", token=tokenD, body={"value": "1"})
check("Demo PUT /policy blocked -> 403", code, [403])

code, _ = req("GET", f"/transactions/{tx_id}", token=tokenD)
check("Demo cannot read real user transaction -> 404", code, [404])

code, _ = req("GET", "/dashboard/metrics", token=tokenD)
check("Demo dashboard -> 200 (demo-workspace data)", code, [200])


# ─── SUMMARY ─────────────────────────────────────────────────────────────────
section("SUMMARY")
total = len(PASS) + len(FAIL) + len(WARN)
print(f"\n  PASSED: {len(PASS)}/{total}")
print(f"  WARNED: {len(WARN)}/{total}")
print(f"  FAILED: {len(FAIL)}/{total}")

if WARN:
    print("\n  Warnings (known gaps, not regressions):")
    for w in WARN:
        print(f"    - {w}")

if FAIL:
    print("\n  FAILED tests:")
    for f in FAIL:
        print(f"    - {f}")
    sys.exit(1)
else:
    print("\n  All hard checks passed. Review warnings above for known gaps.")
print()
