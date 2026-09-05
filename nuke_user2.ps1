$baseUrl = 'https://zoqel-8ly3.onrender.com/api/auth/nuke/user@gmail.com'
for ($i=0; $i -lt 40; $i++) {
    try {
        $res = Invoke-RestMethod -Uri $baseUrl -Method Delete
        if ($res -match 'Successfully deleted' -or $res -match 'User not found') {
            Write-Host 'NUKE_SUCCESS: ' $res
            exit 0
        }
    } catch {
        Write-Host "Not ready yet..."
    }
    Start-Sleep -Seconds 10
}
