# 📋 AWS + Vercel Deployment Checklist

## 🔧 Pre-Deployment (Local Machine)

- [ ] Install Node.js 18+ and npm
- [ ] Install Git
- [ ] Create GitHub account and repo
- [ ] Create AWS account (free tier)
- [ ] Create Vercel account (free tier)

## 📤 Step 1: Push Code to GitHub (5 mins)

```bash
# From your project root
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**After:** Code is on GitHub

---

## ☁️ Step 2: Set Up AWS EC2 Backend (15 mins)

### 2a. Create EC2 Instance
1. Go to [AWS Console](https://console.aws.amazon.com/ec2)
2. **Launch Instance**
   - **Name:** `up-tracker-backend`
   - **AMI:** Ubuntu Server 22.04 LTS (free)
   - **Instance Type:** `t2.micro` (free)
   - **Create key pair:** Download `.pem` file → **Save securely!**
   - **Security Group:**
     - HTTP (80)
     - HTTPS (443)
     - SSH (22)
   - **Storage:** 20GB (free tier)
3. **Launch** and wait 1-2 mins

- [ ] EC2 instance created
- [ ] Key pair saved

### 2b. Get Your EC2 Details
- Go to instances list
- Copy: **Public IPv4 address** (e.g., `54.123.456.789`)
- Save this — you'll need it!

- [ ] Noted EC2 public IP

### 2c. Connect via SSH
```bash
# On your local machine (where you saved the .pem file)
chmod 600 your-key-name.pem
ssh -i your-key-name.pem ubuntu@54.123.456.789
```

- [ ] SSH connection successful

### 2d. Deploy Backend
```bash
# On EC2 instance (inside SSH session)
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/backend

# Run one-time setup
sudo bash install-aws.sh
# Wait ~5 mins for installation...

# Create .env file
nano .env
```

Paste this (replace with your Vercel frontend URL):
```
FRONTEND_URL=https://your-app.vercel.app
PORT=4000
HEADLESS=false
```

Press `Ctrl+O`, Enter, `Ctrl+X` to save.

```bash
# Install dependencies
npm install

# Verify it works
npm start
```

- [ ] Backend running on EC2 (should see "Server running on port 4000")
- [ ] Exit with `Ctrl+C`

### 2e. Keep Backend Running with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd /home/ubuntu/YOUR_REPO/backend
pm2 start server.js --name "up-tracker"

# Make it auto-restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status
```

- [ ] PM2 configured

### 2f. Get Elastic IP (keeps IP static)
1. EC2 Dashboard → **Elastic IPs**
2. **Allocate Elastic IP** → Allocate
3. Select IP → **Associate** → Choose your instance
4. Save this IP address!

- [ ] Elastic IP assigned (e.g., `52.123.456.789`)

---

## 🚀 Step 3: Deploy Frontend to Vercel (5 mins)

### 3a. Connect Vercel to GitHub
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Add New** → **Project**
3. **Import Git Repository**
4. **Authorize GitHub** → Select your repo
5. **Continue**

- [ ] Vercel can access your GitHub repo

### 3b. Configure Project
1. **Framework:** Select "Vite"
2. **Root Directory:** `./frontend`
3. **Build Command:** `npm run build` (should already be filled)
4. **Output Directory:** `dist`

- [ ] Configuration set

### 3c. Add Environment Variables
1. **Environment Variables** section:
   - **Name:** `VITE_API_URL`
   - **Value:** `http://52.123.456.789:4000` ← Use your Elastic IP!
   - Click **Add**

- [ ] Environment variable added

### 3d. Deploy!
1. Click **Deploy**
2. Wait 2-3 minutes
3. You'll see: "Congratulations! Your project has been deployed"

- [ ] Frontend deployed to Vercel
- [ ] Copy Vercel URL (e.g., `https://up-tracker.vercel.app`)

---

## 🔗 Step 4: Connect Frontend to Backend

### 4a. Update Backend CORS (on EC2)
```bash
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
cd YOUR_REPO/backend

# Edit .env
nano .env
```

Update `FRONTEND_URL`:
```
FRONTEND_URL=https://up-tracker.vercel.app
```

Save and restart PM2:
```bash
pm2 restart all
pm2 logs
```

- [ ] Backend updated

### 4b. Test the Connection
1. Go to your Vercel URL: `https://up-tracker.vercel.app`
2. Try loading articles/data
3. Check browser console for errors (F12)

If working:
- [ ] Frontend ↔ Backend connection successful! ✅

---

## 🔐 Step 5: Optional - Add Custom Domain

### 5a. Vercel Domain
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `politics-tracker.com`)
3. Follow DNS instructions
4. Update backend `.env`: `FRONTEND_URL=https://politics-tracker.com`

- [ ] Custom domain configured

### 5b. API Domain (Advanced)
Get a subdomain like `api.politics-tracker.com` pointing to EC2 using Route53 or your DNS provider.

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] EC2 instance running with backend
- [ ] Backend running on PM2
- [ ] Elastic IP assigned
- [ ] Vercel frontend deployed
- [ ] Environment variables set
- [ ] Frontend loads without CORS errors
- [ ] Can fetch articles and see sentiment data

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't SSH into EC2 | Check security group allows SSH (port 22) |
| Backend not responding | SSH and run `pm2 logs` to see errors |
| CORS errors on frontend | Check `FRONTEND_URL` in backend `.env` |
| Vercel build fails | Check `frontend/package.json` dependencies |
| Articles not loading | Backend might not have Chrome/Xvfb running |

## 📞 Support
Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for more details.

---

## 💰 Costs (Monthly Estimate)
- AWS EC2: Free year 1, then ~$7-10/month
- Vercel: Free
- Domain (optional): ~$12/year
- **Total:** ~$0-10/month ✅
