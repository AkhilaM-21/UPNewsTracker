# 🚀 Deployment Guide: AWS + Vercel

## Quick Summary
- **Backend (Node.js)** → AWS EC2
- **Frontend (React + Vite)** → Vercel
- **Cost**: ~$9-15/month (AWS) + Free (Vercel)

---

## Part 1: AWS EC2 Backend Deployment

### Step 1: Create AWS EC2 Instance
1. Go to [AWS Console](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. **AMI**: Select "Ubuntu Server 22.04 LTS" (free tier eligible)
4. **Instance Type**: `t2.micro` (free tier)
5. **Security Group**: Open ports:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 4000 (Backend API - optional, internal only)
6. **Key Pair**: Create & download `.pem` file (keep it safe!)
7. Launch and wait 1-2 minutes

### Step 2: SSH into EC2 Instance
```bash
# On your local machine
chmod 600 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Run Setup Script
```bash
cd /home/ubuntu
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name/backend
chmod +x install-aws.sh
sudo bash install-aws.sh
```
This installs:
- Node.js 20
- Google Chrome
- Xvfb (virtual display)
- Dependencies

### Step 4: Create `.env` on EC2
```bash
nano .env
```
Paste this (update FRONTEND_URL):
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=4000
HEADLESS=false
```

### Step 5: Install Backend Dependencies
```bash
npm install
```

### Step 6: Start the Backend
```bash
# Terminal 1: Start Xvfb
Xvfb :99 -screen 0 1024x768x24 &

# Terminal 2: Start Node server
bash start.sh
```

Or use **PM2** for persistent running:
```bash
npm install -g pm2
pm2 start server.js --name "up-tracker"
pm2 startup
pm2 save
```

### Step 7: Get EC2 Elastic IP (so it doesn't change)
- Go to AWS Console → Elastic IPs
- Allocate a new address
- Associate with your instance

---

## Part 2: Vercel Frontend Deployment

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 2: Add Vercel Config
The `vercel.json` is already set up. Make sure `.env` file is in frontend root:
```
VITE_API_URL=https://your-ec2-ip-or-domain:4000
```

Actually, better: Update `src/api.js` to use environment variable:

### Step 3: Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repo
4. **Framework**: Vite
5. **Build Command**: `npm run build`
6. **Output Dir**: `dist`
7. **Environment Variables**:
   - `VITE_API_URL` = `https://YOUR_AWS_ELASTIC_IP:4000`

### Step 4: Deploy!
Click **Deploy** and wait ~2 min

---

## Part 3: Connect Frontend → Backend

Update [frontend/src/api.js](frontend/src/api.js):
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchNews(query, dateRange = 30) {
  const response = await fetch(`${API_BASE}/api/news?q=${encodeURIComponent(query)}&days=${dateRange}`);
  return response.json();
}
```

---

## Part 4: Enable HTTPS (Optional but Recommended)

### Option A: AWS Certificate Manager (FREE)
```bash
# On EC2:
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### Option B: Use Nginx as Reverse Proxy
```bash
sudo apt install nginx
```

Create `/etc/nginx/sites-available/tracker`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then:
```bash
sudo ln -s /etc/nginx/sites-available/tracker /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## Troubleshooting

### Backend not responding
```bash
# SSH into EC2 and check:
ps aux | grep node
curl http://localhost:4000/api/health
```

### Chrome/Selenium issues on AWS
```bash
# Check Xvfb is running:
ps aux | grep Xvfb

# Kill and restart:
pkill -f Xvfb
Xvfb :99 -screen 0 1024x768x24 &
```

### CORS errors on frontend
Make sure `FRONTEND_URL` is set correctly in backend `.env`

---

## Costs Breakdown

| Service | Instance | Cost/Month |
|---------|----------|-----------|
| AWS EC2 | t2.micro | $0 (first year) or ~$7 |
| AWS Data Transfer | Outbound | ~$1-2 |
| Domain (optional) | .com | ~$12 |
| Vercel | Free tier | Free |

---

## Monitoring & Logs

### Backend Logs
```bash
pm2 logs up-tracker
```

### Frontend Analytics
- Vercel Dashboard shows deployments, errors, analytics

---

## Next Steps
1. Create AWS account & EC2 instance
2. Generate key pair and SSH in
3. Run deployment steps in order
4. Get Vercel account & connect GitHub
5. Test at `https://your-domain.vercel.app`

✅ **You're ready to deploy!**
