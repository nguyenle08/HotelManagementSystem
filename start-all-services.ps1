# ============================================================================
# HMS MICROSERVICES STARTUP SCRIPT
# ============================================================================

Write-Host "Starting Hotel Management System..." -ForegroundColor Cyan

$backend = "D:\Working\HotelManagementSystem\hms_backend"

function Start-Service {
    param ([string]$Name, [string]$Path, [int]$Delay)
    Write-Host ">> Launching $Name..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; .\mvnw.cmd spring-boot:run"
    if ($Delay -gt 0) { Start-Sleep -Seconds $Delay }
}

# 1. Discovery Server (Must be first)
Start-Service "Discovery Server" "$backend\discovery-server" 15

# 2. Gateway
Start-Service "API Gateway" "$backend\api-gateway" 10

# 3. Core Services
Start-Service "Auth Service" "$backend\auth-service" 5
Start-Service "User Service" "$backend\user-service" 5
Start-Service "Room Service" "$backend\room-service" 5
Start-Service "Reservation Service" "$backend\reservation-service" 0

Write-Host ""
Write-Host "SUCCESS: All commands sent to PowerShell terminals." -ForegroundColor Green
Write-Host "Check the new windows for startup logs." -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")