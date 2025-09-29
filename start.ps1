# Blue Carbon Registry - Quick Start Script for Windows PowerShell

Write-Host "Starting Blue Carbon Registry Application..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Application on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "==========================================="-ForegroundColor Cyan
Write-Host "Blue Carbon Registry is starting!" -ForegroundColor Green
Write-Host "==========================================="-ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend App: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open the application in your browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open in browser
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "Application is running! To stop, close the PowerShell windows." -ForegroundColor Yellow