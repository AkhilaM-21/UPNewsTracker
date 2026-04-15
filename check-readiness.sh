#!/bin/bash
# Quick deployment checklist script
# Run this to verify your setup before deploying

echo "🔍 Checking deployment readiness..."
echo ""

# Check Git
if command -v git &> /dev/null; then
    echo "✅ Git installed"
else
    echo "❌ Git not installed - need to install: https://git-scm.com"
fi

# Check Node
if command -v node &> /dev/null; then
    echo "✅ Node $(node --version) installed"
else
    echo "❌ Node not installed - install from https://nodejs.org"
fi

# Check npm dependencies
echo ""
echo "📦 Checking dependencies..."
echo ""

echo "Backend dependencies:"
cd backend
npm list 2>&1 | head -5
cd ../

echo ""
echo "Frontend dependencies:"
cd frontend
npm list 2>&1 | head -5
cd ../

# Check files exist
echo ""
echo "📄 Checking required files..."

files_to_check=(
    "backend/.env.example"
    "backend/server.js"
    "backend/package.json"
    "backend/install-aws.sh"
    "frontend/src/api.js"
    "frontend/vercel.json"
    "frontend/package.json"
    "DEPLOYMENT_GUIDE.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
    fi
done

echo ""
echo "🚀 To deploy:"
echo "1. Create AWS EC2 instance (free tier t2.micro)"
echo "2. SSH into instance and run: sudo bash backend/install-aws.sh"
echo "3. Create Vercel account and connect GitHub"
echo "4. Follow steps in DEPLOYMENT_GUIDE.md"
