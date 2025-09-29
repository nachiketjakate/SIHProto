# Start both servers for Blue Carbon Registry

Write-Host "Starting Blue Carbon Registry Servers..." -ForegroundColor Green
Write-Host ""

# Start Backend in new window
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; npm run dev"

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Start Frontend in new window
Write-Host "Starting Frontend Application (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Frontend Application Starting...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait a few seconds, then press Enter to open the application..."
$null = Read-Host

# Open browser
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "Application opened in browser!" -ForegroundColor Green
Write-Host "To stop servers, close the PowerShell windows." -ForegroundColor Yellow