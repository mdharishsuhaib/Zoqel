# Zoqel — Failure Analysis

> Razorpay's evaluation criteria explicitly asks for evidence of failures encountered
> and how they were resolved. This document records real failures during development.

---

## Format

Each entry follows:
- **Failure**: What broke
- **Root cause**: Why it broke
- **Fix**: What was changed
- **Result**: Verification that the fix worked

---

## Failure 001 — Agent Repeated Retries on the Same Transaction

**Failure**  
During integration testing, calling `POST /api/recovery/process/{transactionId}` twice
on the same FAILED transaction caused the agent to recommend RETRY both times, resulting
in two retry attempts on a single transaction — violating the `max_retries = 1` policy.

**Root cause**  
The first call to `process()` updated `RetryCount` to 1 and closed the case as RECOVERED.
However, when called again with the same transaction (still in FAILED state in the test),
a new `RecoveryCase` was opened (because the existing case wasn't checked first) and the
retry count started fresh at 0 — making the policy check pass incorrectly.

**Fix**  
Added an idempotency check at the start of `RecoveryCaseService.process()`:
```java
Optional<RecoveryCase> existing = recoveryCaseRepository.findByTransactionId(transactionId);
if (existing.isPresent()) {
    RecoveryCaseStatus s = existing.get().getStatus();
    if (s == RECOVERED || s == FAILED || s == ESCALATED || s == IGNORED) {
        return existing.get();  // Case already closed — return immediately
    }
}
```
Also added a check: if the transaction status is not FAILED, throw an
`IllegalStateException("Transaction is not in FAILED status")`.

**Result**  
Calling `process()` on the same transaction twice now returns the existing closed case
on the second call without re-executing any actions. The retry count is correct.

---

## Failure 002 — Policy Engine Loaded Rules on Every Call

**Failure**  
Under load testing with 100 concurrent recovery requests, each call to `PolicyEngine.evaluate()`
triggered N separate database queries (one per rule key), causing 700+ DB queries per second.

**Root cause**  
`policyRepository.findByRuleKey(key)` was called inline for each rule during evaluation,
with no caching. For 7 policy rules and 100 concurrent calls, this was 700 queries/second.

**Fix**  
Changed `PolicyEngine` to load all rules at once:
```java
Map<String, String> rules = policyRepository.findAll()
    .stream()
    .collect(Collectors.toMap(PolicyRule::getRuleKey, PolicyRule::getRuleValue));
```
This reduces N DB calls to 1 per policy evaluation.

**Result**  
DB query count dropped from O(N rules) to O(1) per evaluation.

---

## Failure 003 — LLM Returned Non-JSON Response

**Failure**  
In early testing, GPT-4o occasionally returned responses with markdown code fences:
```
```json
{"decision": "RETRY", ...}
```
```
Causing `ObjectMapper.readValue()` to throw `JsonParseException`.

**Root cause**  
The system prompt said "respond with ONLY a JSON object" but GPT-4o occasionally
added markdown formatting despite this instruction.

**Fix**  
Added a cleaning step in `OpenRouterAgentGateway.recommend()` before parsing:
```java
String content = rawContent.trim();
// Strip markdown code fences if present
if (content.startsWith("```")) {
    content = content.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
}
AgentDecision decision = objectMapper.readValue(content, AgentDecision.class);
```
Also strengthened the system prompt: added explicit instruction "Do NOT wrap in markdown
code fences or any other formatting. Output only the raw JSON object."

**Result**  
Response parsing succeeds even when the LLM adds code fences. The fallback
handler still activates on any remaining parse failures.

---

## Failure 004 — Integer Overflow in Revenue Metrics

**Failure**  
The dashboard showed `revenueAtRiskPaise` as a negative number during batch evaluation
with 10,000 transactions averaging ₹5,000 each.

**Root cause**  
`TransactionRepository.sumAmountByStatus()` was incorrectly declared to return `int`
instead of `long`. With 10,000 × 500,000 paise = 5,000,000,000 paise (= ₹5 crore),
the value overflowed a 32-bit integer (max ~2.1 billion).

**Fix**  
Changed the repository query return type from `int` to `long`:
```java
@Query("SELECT COALESCE(SUM(t.amountPaise), 0) FROM Transaction t WHERE t.status = :status")
long sumAmountByStatus(@Param("status") TransactionStatus status);
```
And updated all dashboard DTO fields to use `long`.

**Result**  
Revenue metrics display correctly for datasets up to 9.2 × 10^18 paise (₹92,233,720 crore)
— well beyond any realistic test scenario.

---

## Failure 005 — Flyway Migration Failed on Clean Docker Restart

**Failure**  
After `docker compose down -v` and `docker compose up`, the backend failed to start
with `FlywayException: Found non-empty schema without flyway tables`.

**Root cause**  
`spring.flyway.baseline-on-migrate: true` was set but the schema was not empty
(some migration had been applied outside Flyway in an earlier manual test run).
The combination caused Flyway to refuse to run.

**Fix**  
Two changes:
1. Added `spring.flyway.clean-on-validation-error: false` (don't silently destroy data)
2. In `docker-compose.yml`, added `volumes: postgres_data:` with a named volume
   so `docker compose down` without `-v` preserves data, while `docker compose down -v`
   cleanly wipes the named volume and lets Flyway start fresh.

**Result**  
Clean restarts with `docker compose down -v && docker compose up` work reliably.
Normal restarts preserve the database.

---

## Failure 006 — CORS Blocking Frontend API Calls

**Failure**  
After starting both services separately (not via Docker Compose), the frontend at
`http://localhost:3000` received `CORS policy: No 'Access-Control-Allow-Origin'` errors
on all `/api` requests.

**Root cause**  
`WebConfig.java` had `allowedOrigins("http://localhost:3000")` but the browser was also
sending preflight `OPTIONS` requests that weren't being handled.

**Fix**  
Updated `WebConfig.java`:
```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOriginPatterns("*")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(false)
        .maxAge(3600);
}
```
Added `OPTIONS` to allowed methods and used `allowedOriginPatterns("*")` for development.

**Result**  
All API calls from frontend succeed. CORS headers are correctly set on all responses
including preflight `OPTIONS` requests.

---

*This document is updated continuously during development.*  
*Honest failure documentation is a core deliverable.*
