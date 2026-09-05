$baseUrl = "https://zoqel-8ly3.onrender.com/api"

function Get-Token {
    param ($email)
    $body = @{ fullName = "Test"; email = $email; password = "pwd" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
    if (!$res) {
        $body = @{ email = $email; password = "pwd" } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    }
    return $res.token
}

function Create-Workspace {
    param ($token, $name)
    $headers = @{ "Authorization" = "Bearer $token" }
    $body = @{ name = $name; businessType = "SaaS" } | ConvertTo-Json
    return Invoke-RestMethod -Uri "$baseUrl/workspaces" -Method Post -Headers $headers -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
}

Write-Host "Waiting for deployment to finish..."
Start-Sleep -Seconds 60

$tokenA = Get-Token "userA_233041@example.com"
$tokenB = Get-Token "userB_233041@example.com"

$wsA = Create-Workspace $tokenA "Workspace A"
$wsB = Create-Workspace $tokenB "Workspace B"

Write-Host "Token A: $tokenA"
Write-Host "Token B: $tokenB"
Write-Host "Workspace A: $($wsA.id)"
Write-Host "Workspace B: $($wsB.id)"

# User A tries to get User B's workspace info (Should be 404 or not allowed because /me is only available)
# Wait, /me returns their own workspace. Let's see:
$headersA = @{ "Authorization" = "Bearer $tokenA" }
$me = Invoke-RestMethod -Uri "$baseUrl/workspaces/me" -Method Get -Headers $headersA
Write-Host "User A /me Workspace ID: $($me.id) (Expected: $($wsA.id))"

# Check transactions for User A
$txA = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method Get -Headers $headersA
Write-Host "User A Tx Count: $($txA.content.Count)"

