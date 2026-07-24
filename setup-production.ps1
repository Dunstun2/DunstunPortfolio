# Production Setup Script
# Run this before deploying to production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Portfolio Production Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Install PostgreSQL drivers
Write-Host "Installing PostgreSQL drivers..." -ForegroundColor Yellow
Set-Location backend
npm install pg@^8.11.3 pg-hstore@^2.3.4
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL drivers installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install PostgreSQL drivers" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Generate JWT Secret
Write-Host "Generating JWT Secret..." -ForegroundColor Yellow
Write-Host "Copy this value for JWT_SECRET:" -ForegroundColor Cyan
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found - using .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}
Write-Host ""

# Return to root
Set-Location ..

# Check frontend dependencies
Write-Host "Checking frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
$frontendCheck = npm list
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies OK" -ForegroundColor Green
} else {
    Write-Host "⚠ Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}
Write-Host ""

# Return to root
Set-Location ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open DEPLOY_NOW.md for deployment instructions" -ForegroundColor White
Write-Host "2. Generate Gmail App Password (see guide)" -ForegroundColor White
Write-Host "3. Choose deployment platform (Railway recommended)" -ForegroundColor White
Write-Host "4. Follow platform-specific instructions" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "- DEPLOY_NOW.md              - Quick deployment guide" -ForegroundColor White
Write-Host "- PRODUCTION_SETUP_GUIDE.md  - Complete guide" -ForegroundColor White
Write-Host "- ENVIRONMENT_VARIABLES_QUICK_REF.md - Variable reference" -ForegroundColor White
Write-Host ""
Write-Host "Good luck with your deployment! 🚀" -ForegroundColor Cyan
