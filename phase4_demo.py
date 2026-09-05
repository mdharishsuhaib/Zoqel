"""Poll Render until the joinedAt fix is live, then run the full Phase 4 simulation."""
import urllib.request, urllib.error, json, time, sys

BASE = "https://zoqel-8ly3.onrender.com/api"


def req(method, path, token=None, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def section(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")


print("Waiting for Render build c88f408 (joinedAt fix)...")
token = None
customer_id = None
for attempt in range(15):
    ts = str(int(time.time()))
    code, data = req("POST", "/auth/register", body={"fullName": "T", "email": f"chk{ts}@z.local", "password": "p"})
    t = data.get("token") if str(code).startswith("2") else None
    if not t:
        print(f"  [{attempt+1}] register {code}")
        time.sleep(10)
        continue
    req("POST", "/workspaces", token=t, body={"name": "T", "businessType": "SaaS"})
    code2, r2 = req("POST", "/customers", token=t, body={"name": "A", "email": f"a{ts}@b.com", "phone": "1"})
    if str(code2).startswith("2"):
        print(f"  BUILD LIVE! POST /customers -> 200, id={r2.get('id')}")
        token = t
        customer_id = r2.get("id")
        break
    msg = r2[:100] if isinstance(r2, str) else ""
    print(f"  [{attempt+1}] customers -> {code2}: {msg}")
    time.sleep(15)

if not customer_id:
    print("Build not ready after 15 attempts. Try again in a few minutes.")
    sys.exit(1)

# ─── Configure policy ────────────────────────────────────────────────────────
for key, val in [
    ("max_auto_amount_paise", "1000000"),
    ("min_recovery_confidence", "0.70"),
    ("max_retries_per_transaction", "3"),
    ("require_human_for_repeated_failure", "false"),
]:
    req("PUT", f"/policy/{key}", token=token, body={"value": val})
print("Policies configured")

# ─── Stage 1: Ingest failed transaction ────────────────────────────────────
section("STAGE 1 -- Transaction Ingestion (Rs.4,999 NETWORK_ERROR)")
code, data = req("POST", "/transactions/simulate", token=token, body={
    "customerId": customer_id,
    "amountPaise": 499900,
    "failureReason": "NETWORK_ERROR",
    "paymentMethod": "UPI"
})
if not str(code).startswith("2"):
    print(f"FAIL {code}: {data}")
    sys.exit(1)
tx_id = data["id"]
amount = data["amountPaise"] / 100
print(f"  id:            {tx_id}")
print(f"  amount:        Rs.{amount:,.2f}")
print(f"  status:        {data['status']}")
print(f"  failureReason: {data.get('failureReason')}")

# ─── Stages 2-6: AI Pipeline ─────────────────────────────────────────────────
section("STAGES 2-6 -- AI Recovery Pipeline")
print("  Risk -> Probability -> Policy -> Agent -> Simulator...")
code, data = req("POST", f"/recovery/process/{tx_id}", token=token)
if not str(code).startswith("2"):
    print(f"FAIL {code}: {data}")
    sys.exit(1)
rc = data
print(f"  case id:       {rc.get('id')}")
print(f"  status:        {rc.get('status')}")
print(f"  agentDecision: {rc.get('agentDecision')}")
print(f"  retryCount:    {rc.get('retryCount')}")
print(f"  riskScore:     {rc.get('riskScore')}")

# ─── Stage 7: Audit ──────────────────────────────────────────────────────────
section("STAGE 7 -- Audit Trail")
time.sleep(1)
code, adata = req("GET", "/audit?size=50", token=token)
events = adata.get("content", []) if isinstance(adata, dict) else []
tx_events = sorted([e for e in events if e.get("transactionId") == tx_id],
                   key=lambda x: x.get("occurredAt", ""))
if tx_events:
    for e in tx_events:
        print(f"  [{e.get('eventType','?'):<38}] {e.get('eventDetail','')}")
else:
    print(f"  (No events for tx yet — {len(events)} total workspace events found)")
    for e in events[:3]:
        print(f"  [{e.get('eventType','?'):<38}] {e.get('eventDetail','')}")

# ─── Stage 7b: Dashboard ─────────────────────────────────────────────────────
section("STAGE 7b -- Dashboard Metrics")
code, m = req("GET", "/dashboard/metrics", token=token)
if str(code).startswith("2"):
    print(f"  totalTransactions:    {m.get('totalTransactionsAnalyzed')}")
    print(f"  failedTransactions:   {m.get('failedTransactions')}")
    print(f"  revenueAtRisk:        Rs.{m.get('revenueAtRiskPaise', 0)/100:,.2f}")
    print(f"  revenueRecovered:     Rs.{m.get('revenueRecoveredPaise', 0)/100:,.2f}")
    print(f"  recoveryRate:         {m.get('recoveryRate', 0):.1f}%")
    print(f"  successfulRecoveries: {m.get('successfulRecoveries')}")

# ─── Final status ─────────────────────────────────────────────────────────────
section("FINAL TRANSACTION STATUS")
code, ft = req("GET", f"/transactions/{tx_id}", token=token)
status = ft.get("status", "?") if isinstance(ft, dict) else "?"
print(f"\n  Transaction: {tx_id}")
print(f"  Amount:  Rs.{amount:,.2f}")
print(f"  Status:  {status}")
labels = {
    "RECOVERED": f"\n  SUCCESS: Rs.{amount:,.2f} RECOVERED — Zoqel worked!",
    "ESCALATED": "\n  INFO: Escalated to human review.",
    "FAILED":    "\n  NOTE: Retry attempted; simulator returned failed (random seed).",
    "IN_PROGRESS": "\n  INFO: Recovery still in progress.",
}
print(labels.get(status, f"\n  Status: {status}"))
print()
