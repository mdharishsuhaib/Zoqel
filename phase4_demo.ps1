$baseUrl = "https://zoqel-8ly3.onrender.com/api"

function Request {
    param ($method, $endpoint, $token = $null, $body = $null)
    $args = @("-s", "-X", $method, "$baseUrl$endpoint", "-w", "\n%{http_code}")
    if ($token) { $args += "-H"; $args += "Authorization: Bearer $token" }
    if ($body) { 
        $body | Out-File -FilePath temp.json -Encoding utf8
        $args += "-H"; $args += "Content-Type: application/json"
        $args += "-d"; $args += "@temp.json"
    }
    
    $res = & curl.exe $args
    $code = $res[-1]
    $content = if ($res.Length -gt 1) { $res[0..($res.Length-2)] -join "
" } else { "" }
    return @{ code = $code; content = $content }
}

Write-Host "1. Registering new Demo User..."
$email = "judge_000500@zoqel.local"
$reg = Request "POST" "/auth/register" $null (@{fullName="Hackathon Judge"; email=$email; password="pwd"} | ConvertTo-Json)
$token = ($reg.content | ConvertFrom-Json).token

Write-Host "2. Creating Workspace & Policies..."
Request "POST" "/workspaces" $token (@{name="Judge Workspace"; businessType="E-commerce"} | ConvertTo-Json) > $null
Request "PUT" "/policy/max_auto_amount_paise" $token (@{value="1000000"} | ConvertTo-Json) > $null
Request "PUT" "/policy/min_recovery_confidence" $token (@{value="0.70"} | ConvertTo-Json) > $null

Write-Host "3. Creating Customer..."
$cust = Request "POST" "/customers" $token (@{fullName="John Doe"; email="john@example.com"; phone="+919876543210"} | ConvertTo-Json)
$custId = ($cust.content | ConvertFrom-Json).id

Write-Host "
=================================================="
Write-Host "      ZOQEL END-TO-END RECOVERY SIMULATION"
Write-Host "==================================================
"

Write-Host ">> ?4,999 payment failed (INSUFFICIENT_FUNDS)"
$txRes = Request "POST" "/transactions/simulate" $token (@{customerId=$custId; amountPaise=499900; failureReason="INSUFFICIENT_FUNDS"; paymentMethod="UPI"} | ConvertTo-Json)
$tx = $txRes.content | ConvertFrom-Json
$txId = $tx.id

Write-Host ">> Transaction ID: $txId"
Write-Host ">> Triggering AI Recovery Pipeline..."
$processRes = Request "POST" "/recovery/process/$txId" $token

# Wait a moment
Start-Sleep -Seconds 2

Write-Host "
--- AI Agent Audit Trail ---"
$audit = Request "GET" "/audit?size=20" $token
$events = ($audit.content | ConvertFrom-Json).content
# Events come back sorted by occurredAt desc, so we reverse them
[array]::Reverse($events)

foreach ($e in $events) {
    if ($e.transactionId -eq $txId) {
        Write-Host "[] "
    }
}

Write-Host "
--- Final Transaction Status ---"
$finalTx = Request "GET" "/transactions/$txId" $token
$status = ($finalTx.content | ConvertFrom-Json).status
Write-Host "Status: $status"

