#!/bin/bash
# 🚀 Deployment Quick Commands Reference
# Save this file and refer to it during deployment

echo "======================================"
echo "  UP Tracker — Deployment Commands"
echo "======================================"
echo ""

# STEP 1: GitHub
echo "📤 STEP 1: Push to GitHub"
echo "$ git init"
echo "$ git add ."
echo "$ git commit -m 'Initial commit'"
echo "$ git branch -M main"
echo "$ git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "$ git push -u origin main"
echo ""

# STEP 2: AWS Setup
echo "☁️  STEP 2: AWS Setup"
echo "1. Create EC2 instance (t2.micro, Ubuntu 22.04)"
echo "2. Download .pem key file"
echo "3. SSH command:"
echo "$ chmod 600 your-key.pem"
echo "$ ssh -i your-key.pem ubuntu@YOUR_EC2_IP"
echo ""
echo "4. On EC2, run:"
echo "$ cd /home/ubuntu"
echo "$ git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "$ cd YOUR_REPO/backend"
echo "$ sudo bash install-aws.sh"
echo "$ nano .env  # Add FRONTEND_URL and set HEADLESS=false"
echo "$ npm install"
echo "$ npm install -g pm2"
echo "$ pm2 start server.js --name 'up-tracker'"
echo "$ pm2 startup && pm2 save"
echo ""
echo "5. Get Elastic IP in AWS Console and note it"
echo ""

# STEP 3: Vercel
echo "🚀 STEP 3: Vercel Frontend"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Add New → Project"
echo "3. Import your GitHub repo"
echo "4. Set:"
echo "   - Root Directory: ./frontend"
echo "   - Build: npm run build"
echo "   - Output: dist"
echo "5. Add environment variable:"
echo "   - VITE_API_URL = http://YOUR_ELASTIC_IP:4000"
echo "6. Deploy!"
echo ""

# STEP 4: Connect
echo "🔗 STEP 4: Connect Frontend to Backend"
echo "1. Get Vercel frontend URL"
echo "2. SSH into EC2"
echo "3. Update backend/.env:"
echo "   FRONTEND_URL=https://your-app.vercel.app"
echo "4. Run: pm2 restart all"
echo ""

# STEP 5: Test
echo "✅ STEP 5: Test"
echo "1. Open https://your-app.vercel.app"
echo "2. Try loading articles"
echo "3. Check console (F12) for errors"
echo "4. Done! 🎉"
echo ""

echo "======================================"
echo "📖 Full guide: DEPLOYMENT_GUIDE.md"
echo "📋 Checklist: DEPLOYMENT_CHECKLIST.md"
echo "======================================"
