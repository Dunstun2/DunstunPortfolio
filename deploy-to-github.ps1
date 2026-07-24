# Portfolio Deployment Script
# This script helps deploy your production-ready portfolio to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Portfolio GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not initialized!" -ForegroundColor Red
    Write-Host "Run: git init" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git repository initialized" -ForegroundColor Green
Write-Host ""

# Show current status
Write-Host "📋 Current Git Status:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Show what's being excluded
Write-Host "🚫 Files Being Excluded (Ignored):" -ForegroundColor Yellow
git status --ignored --short | Select-String "^!! "
Write-Host ""

# Verification prompts
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pre-Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$verify1 = Read-Host "Have you reviewed the files being committed? (yes/no)"
if ($verify1 -ne "yes") {
    Write-Host "❌ Please review files first using: git status" -ForegroundColor Red
    exit 1
}

$verify2 = Read-Host "Have you confirmed .env is NOT being committed? (yes/no)"
if ($verify2 -ne "yes") {
    Write-Host "❌ CRITICAL: Never commit .env files!" -ForegroundColor Red
    exit 1
}

$verify3 = Read-Host "Have you confirmed seed scripts are excluded? (yes/no)"
if ($verify3 -ne "yes") {
    Write-Host "❌ Please verify seed scripts are in .gitignore" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All verifications passed!" -ForegroundColor Green
Write-Host ""

# Check if files are staged
$stagedFiles = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($stagedFiles)) {
    Write-Host "⚠️  No files staged for commit" -ForegroundColor Yellow
    $shouldStage = Read-Host "Stage all production files now? (yes/no)"
    if ($shouldStage -eq "yes") {
        Write-Host "Staging files..." -ForegroundColor Cyan
        git add .
        Write-Host "✅ Files staged" -ForegroundColor Green
    } else {
        Write-Host "❌ No files to commit" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Commit
$commitMessage = Read-Host "Enter commit message (default: 'Initial production-ready commit')"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Initial production-ready commit"
}

Write-Host "Creating commit..." -ForegroundColor Cyan
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit created successfully" -ForegroundColor Green
Write-Host ""

# Remote setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Remote Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$hasRemote = git remote get-url origin 2>$null
if ([string]::IsNullOrWhiteSpace($hasRemote)) {
    Write-Host "📝 No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a new repository on GitHub, then enter the URL below:" -ForegroundColor Cyan
    Write-Host "Example: https://github.com/yourusername/portfolio.git" -ForegroundColor Gray
    Write-Host ""
    
    $repoUrl = Read-Host "Enter GitHub repository URL"
    
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "❌ No URL provided" -ForegroundColor Red
        Write-Host "⚠️  Commit created but not pushed. Run manually:" -ForegroundColor Yellow
        Write-Host "   git remote add origin <your-repo-url>" -ForegroundColor Gray
        Write-Host "   git branch -M main" -ForegroundColor Gray
        Write-Host "   git push -u origin main" -ForegroundColor Gray
        exit 0
    }
    
    Write-Host "Adding remote origin..." -ForegroundColor Cyan
    git remote add origin $repoUrl
    Write-Host "✅ Remote added" -ForegroundColor Green
} else {
    Write-Host "✅ Remote origin already configured: $hasRemote" -ForegroundColor Green
}

Write-Host ""

# Rename branch to main if needed
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Renaming branch to 'main'..." -ForegroundColor Cyan
    git branch -M main
    Write-Host "✅ Branch renamed to main" -ForegroundColor Green
}

Write-Host ""

# Push
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$shouldPush = Read-Host "Ready to push to GitHub? (yes/no)"
if ($shouldPush -eq "yes") {
    Write-Host "Pushing to origin/main..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your production-ready portfolio is now on GitHub!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Set up CI/CD (GitHub Actions, etc.)" -ForegroundColor Gray
        Write-Host "2. Deploy to hosting platform (Vercel, Netlify, AWS, etc.)" -ForegroundColor Gray
        Write-Host "3. Configure production environment variables" -ForegroundColor Gray
        Write-Host "4. Set up production database" -ForegroundColor Gray
        Write-Host "5. Create admin user in production" -ForegroundColor Gray
    } else {
        Write-Host "❌ Push failed!" -ForegroundColor Red
        Write-Host "Please check your credentials and repository permissions" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⚠️  Push cancelled" -ForegroundColor Yellow
    Write-Host "Commit created locally. Push manually when ready:" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
