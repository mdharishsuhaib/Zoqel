"""Wake Render then poll for Phase 5 /auth/demo endpoint."""
import urllib.request, urllib.error, json, time, sys

BASE = "https://zoqel-8ly3.onrender.com/api"


def req(method, path, body=None, token=None, timeout=60):
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
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {}
    except Exception as ex:
        return 0, str(ex)


print("Step 1: wake Render via health check...")
code, _ = req("GET", "/actuator/health", timeout=90)
print(f"  health -> {code}")

print("Step 2: poll POST /auth/demo for a8797bd deployment...")
for i in range(14):
    code, d = req("POST", "/auth/demo", timeout=45)
    if str(code).startswith("2"):
        dm = d.get("demoMode")
        ws = d.get("workspaceId")
        tok = d.get("token", "")[:20]
        print(f"  DEPLOYED! demoMode={dm} workspaceId={ws} token={tok}...")
        sys.exit(0)
    msg = str(d)[:100]
    print(f"  [{i+1}] {code}: {msg}")
    time.sleep(15)

print("Build not ready after retries.")
sys.exit(1)
