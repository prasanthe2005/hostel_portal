# Check for existing server on port 5000
$existingProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1

if ($existingProcess) {
    Write-Host "Found server running on PID: $existingProcess" -ForegroundColor Yellow
    Write-Host "Stopping existing server..." -ForegroundColor Yellow
    Stop-Process -Id $existingProcess -Force
    Start-Sleep -Seconds 2
}

Write-Host "Starting server..." -ForegroundColor Green
Set-Location $PSScriptRoot
npm start
