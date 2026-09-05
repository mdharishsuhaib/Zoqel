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

$emailA = "userA_234809@example.com"
$regA = Request "POST" "/auth/register" $null (@{fullName="A"; email=$emailA; password="pwd"} | ConvertTo-Json)
$tokenA = ($regA.content | ConvertFrom-Json).token
Request "POST" "/workspaces" $tokenA (@{name="A WS"; businessType="SaaS"} | ConvertTo-Json) > $null

$emailB = "userB_234809@example.com"
$regB = Request "POST" "/auth/register" $null (@{fullName="B"; email=$emailB; password="pwd"} | ConvertTo-Json)
$tokenB = ($regB.content | ConvertFrom-Json).token
Request "POST" "/workspaces" $tokenB (@{name="B WS"; businessType="SaaS"} | ConvertTo-Json) > $null

# User B creates a mock customer to simulate a transaction on
$custBReq = Request "POST" "/customers" $tokenB (@{email="cb@example.com"; fullName="CB"; phone="+123"} | ConvertTo-Json) # Wait, is there a POST /customers?
# Actually, the background simulator will create transactions on existing customers. But new users have no customers.
# Wait, let me check if there's an API to create a customer. I'll just check if B has any transactions.

Write-Host "--- Test: No JWT ---"
$noJwt = Request "GET" "/transactions"
Write-Host "No JWT -> $($noJwt.code)"

Write-Host "--- Test: Garbage JWT ---"
$garbJwt = Request "GET" "/transactions" "garbage.token.here"
Write-Host "Garbage JWT -> $($garbJwt.code)"

