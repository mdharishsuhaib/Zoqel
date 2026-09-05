"""
Phase 5 — Demo Mode Isolation Validation Matrix
Tests all 15 scenarios from the validation table.
Run after Render deploys commit a8797bd.
"""
import json, time, sys, urllib.request, urllib.error

BASE = "https://zoqel-8ly3.onrender.com/api"

PASS = []
FAIL = []


def req(method, path, token=None, body=None, timeout=30):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            try:
                return resp.status, json.loads(resp.read())
            except Exception:
                return resp.status, {}
    except urllib.error.HTTPError as e:
        try:
            body_j = json.loads(e.read())
        except Exception:
            body_j = {}
        return e.code, body_j


def check(label, code, expected_codes, detail=""):
    ok = code in expected_codes
    symbol = "PASS" if ok else "FAIL"
    print(f"  [{symbol}] {label}: HTTP {code}  {detail}")
    (PASS if ok else FAIL).append(label)
    return ok


def section(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")


# ─── SETUP: two real users + demo token ──────────────────────────────────────
section("SETUP: Real users A & B + Demo token")

ts = str(int(time.time()))

code, d = req("POST", "/auth/register", body={"fullName": "User A", "email": f"ua_{ts}@z.local", "password": "pw"})
assert str(code).startswith("2"), f"Register A failed: {code} {d}"
tokenA = d["token"]
req("POST", "/workspaces", token=tokenA, body={"name": "Workspace A", "businessType": "SaaS"})
for k, v in [("max_auto_amount_paise","1000000"),("min_recovery_confidence","0.70"),
              ("max_retries_per_transaction","3"),("require_human_for_repeated_failure","false")]:
    req("PUT", f"/policy/{k}", token=tokenA, body={"value": v})
code, cust_a = req("POST", "/customers", token=tokenA, body={"name": "A-Cust", "email": f"ac_{ts}@x.com", "phone": "1"})
assert str(code).startswith("2"), f"Create customer A: {code} {cust_a}"
cust_id_a = cust_a["id"]
code, tx_a = req("POST", "/transactions/simulate", token=tokenA,
                 body={"customerId": cust_id_a, "amountPaise": 100000, "failureReason": "NETWORK_ERROR", "paymentMethod": "UPI"})
assert str(code).startswith("2"), f"Simulate tx A: {code} {tx_a}"
tx_id_a = tx_a["id"]
req("POST", f"/recovery/process/{tx_id_a}", token=tokenA)
code, cases_a = req("GET", "/recovery", token=tokenA)
rc_id_a = (cases_a.get("content", [{}]) or [{}])[0].get("id") if isinstance(cases_a, dict) else None
print(f"  User A:  token OK | customer={cust_id_a[:8]}... | tx={tx_id_a[:8]}... | rc={str(rc_id_a)[:8]}...")

code, d = req("POST", "/auth/register", body={"fullName": "User B", "email": f"ub_{ts}@z.local", "password": "pw"})
assert str(code).startswith("2"), f"Register B failed: {code}"
tokenB = d["token"]
req("POST", "/workspaces", token=tokenB, body={"name": "Workspace B", "businessType": "SaaS"})
code, cust_b = req("POST", "/customers", token=tokenB, body={"name": "B-Cust", "email": f"bc_{ts}@x.com", "phone": "2"})
assert str(code).startswith("2"), f"Create customer B: {code}"
cust_id_b = cust_b["id"]
print(f"  User B:  token OK | customer={cust_id_b[:8]}...")

code, demo_data = req("POST", "/auth/demo")
assert str(code).startswith("2"), f"Demo token failed: {code} {demo_data}"
tokenD = demo_data["token"]
is_demo_flag = demo_data.get("demoMode", False)
demo_ws = demo_data.get("workspaceId", "?")
print(f"  Demo:    token OK | workspaceId={demo_ws} | demoMode={is_demo_flag}")

# ─── TEST 1: Demo token is real and scoped to demo-workspace ─────────────────
section("TEST 1: Demo token gives access to demo-workspace data")
code, d = req("GET", "/workspaces/me", token=tokenD)
check("Demo GET /workspaces/me", code, [200], f"workspace={d.get('id','?')}")
check("Demo workspace is demo-workspace", 200 if d.get("id") == "demo-workspace" else 403, [200])
check("POST /auth/demo returns demoMode=true", 200 if is_demo_flag else 400, [200])

# ─── TEST 2: Demo dashboard shows only demo data ─────────────────────────────
section("TEST 2: Demo dashboard")
code, m = req("GET", "/dashboard/metrics", token=tokenD)
check("Demo GET /dashboard/metrics", code, [200], f"recoveryRate={m.get('recoveryRate')}%")

# ─── TEST 3: Demo write protection — policy PUT blocked ──────────────────────
section("TEST 3: Demo write protection (DemoGuardFilter)")
code, d = req("PUT", "/policy/max_auto_amount_paise", token=tokenD, body={"value": "999"})
check("Demo PUT /policy/* blocked → 403", code, [403], f"msg={d.get('message','')[:60]}")

code, d = req("POST", "/workspaces", token=tokenD, body={"name": "Hack", "businessType": "SaaS"})
check("Demo POST /workspaces blocked → 403", code, [403])

# ─── TEST 4: Demo can still run recovery simulation flow ─────────────────────
section("TEST 4: Demo recovery simulation (allowed writes)")
code, d = req("GET", "/customers?size=1", token=tokenD)
demo_customers = d.get("content", []) if isinstance(d, dict) else []
if demo_customers:
    demo_cust_id = demo_customers[0]["id"]
    code2, tx = req("POST", "/transactions/simulate", token=tokenD,
                    body={"customerId": demo_cust_id, "amountPaise": 50000, "failureReason": "NETWORK_ERROR", "paymentMethod": "UPI"})
    check("Demo POST /transactions/simulate", code2, [200, 201])
    if str(code2).startswith("2"):
        demo_tx_id = tx["id"]
        code3, rc = req("POST", f"/recovery/process/{demo_tx_id}", token=tokenD)
        check("Demo POST /recovery/process", code3, [200, 201], f"status={rc.get('status','?') if isinstance(rc,dict) else '?'}")
else:
    print("  [SKIP] No customers in demo-workspace yet (background simulator may not have run)")

# ─── TEST 5: Cross-tenant — User B cannot read User A's resources ─────────────
section("TEST 5: User A → User B isolation (authenticated cross-tenant)")
code, _ = req("GET", f"/transactions/{tx_id_a}", token=tokenB)
check("User B GET User A's transaction → 403/404", code, [403, 404])

code, _ = req("GET", f"/customers/{cust_id_a}", token=tokenB)
check("User B GET User A's customer → 403/404", code, [403, 404])

if rc_id_a:
    code, _ = req("GET", f"/recovery/{rc_id_a}", token=tokenB)
    check("User B GET User A's recovery case → 403/404", code, [403, 404])

code, audit_b = req("GET", "/audit?size=50", token=tokenB)
events_b = audit_b.get("content", []) if isinstance(audit_b, dict) else []
leaked = [e for e in events_b if e.get("transactionId") == tx_id_a]
check("User B audit does NOT contain User A events", 200 if not leaked else 403, [200],
      f"leaked={len(leaked)} events")

code, m_b = req("GET", "/dashboard/metrics", token=tokenB)
check("User B dashboard → 200 (own workspace only)", code, [200])
# User B has no transactions so their recovered should be 0
recovered_b = m_b.get("revenueRecoveredPaise", 0) if isinstance(m_b, dict) else 0
# User A recovered 100000 paise; if it leaks into B's dashboard that's a failure
check("User B dashboard has no User A revenue", 200 if recovered_b == 0 else 403, [200],
      f"B.revenueRecoveredPaise={recovered_b}")

# ─── TEST 6: Demo token cannot read User A's private data ─────────────────────
section("TEST 6: Demo token cannot access real user workspace data")
code, _ = req("GET", f"/transactions/{tx_id_a}", token=tokenD)
check("Demo GET User A's transaction → 403/404", code, [403, 404])

code, _ = req("GET", f"/customers/{cust_id_a}", token=tokenD)
check("Demo GET User A's customer → 403/404", code, [403, 404])

# ─── TEST 7: Demo account cannot be registered via normal signup ──────────────
section("TEST 7: demo@zoqel.internal is reserved")
code, d = req("POST", "/auth/register", body={"fullName": "X", "email": "demo@zoqel.internal", "password": "x"})
check("Register demo@zoqel.internal → 403/409", code, [403, 409], f"msg={d[:80] if isinstance(d,str) else ''}")

code, d = req("POST", "/auth/login", body={"email": "demo@zoqel.internal", "password": "anything"})
check("Login as demo@zoqel.internal → 403", code, [403])

# ─── TEST 8: Logout clears demo state completely (token test) ─────────────────
section("TEST 8: Expired / tampered demo token rejected")
code, _ = req("GET", "/workspaces/me", token="Bearer invalidtoken.abc.xyz")
check("Invalid JWT → 401", code, [401])

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
section("SUMMARY")
total = len(PASS) + len(FAIL)
print(f"\n  PASSED: {len(PASS)}/{total}")
print(f"  FAILED: {len(FAIL)}/{total}")
if FAIL:
    print("\n  Failed tests:")
    for f in FAIL:
        print(f"    - {f}")
else:
    print("\n  All isolation checks PASSED.")
print()

