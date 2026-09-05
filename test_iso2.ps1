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

Write-Host "Waiting 20 seconds for deployment..."
Start-Sleep -Seconds 20

$emailA = "userA_233100@example.com"
$regA = Request "POST" "/auth/register" $null (@{fullName="A"; email=$emailA; password="pwd"} | ConvertTo-Json)
$tokenA = ($regA.content | ConvertFrom-Json).token

$emailB = "userB_233100@example.com"
$regB = Request "POST" "/auth/register" $null (@{fullName="B"; email=$emailB; password="pwd"} | ConvertTo-Json)
$tokenB = ($regB.content | ConvertFrom-Json).token

Write-Host "A: $tokenA"
Write-Host "B: $tokenB"

$wsA = Request "POST" "/workspaces" $tokenA (@{name="A WS"; businessType="SaaS"} | ConvertTo-Json)
$wsB = Request "POST" "/workspaces" $tokenB (@{name="B WS"; businessType="SaaS"} | ConvertTo-Json)

$getMeA = Request "GET" "/workspaces/me" $tokenA
Write-Host "User A /me returns: $($getMeA.code) $($getMeA.content)"

$getMeB = Request "GET" "/workspaces/me" $tokenB
Write-Host "User B /me returns: $($getMeB.code) $($getMeB.content)"

$txA = Request "GET" "/transactions" $tokenA
Write-Host "User A Transactions: $($txA.code)"

$txB = Request "GET" "/transactions" $tokenB
Write-Host "User B Transactions: $($txB.code)"

