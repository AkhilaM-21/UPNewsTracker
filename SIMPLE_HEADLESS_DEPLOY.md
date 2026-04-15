# 🚀 Simple Headless Deployment (No Scripts, No PM2)

## For AWS EC2 (or any server)

### Step 1: SSH into Server
```bash
ssh -i key.pem ubuntu@your-ip
```

### Step 2: Clone Repo
```bash
cd /home/ubuntu
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend
```

### Step 3: Create .env
```bash
cat > .env << EOF
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=4000
HEADLESS=true
EOF
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Run Server
```bash
npm start
```

**Output:**
```
✅ Server running on port 4000
```

---

## 🎯 That's It!

No install-aws.sh. No start.sh. No PM2. Just headless Chrome.

---

## To Keep Running After SSH Disconnects

Use `screen` (already installed):

```bash
# Start screen
screen -S backend

# Inside screen, run:
npm start

# Detach: Ctrl+A then D

# Later, reattach:
screen -r backend
```

---

## Environment Variables

```
FRONTEND_URL    → Your Vercel frontend domain
PORT            → Backend port (4000)
HEADLESS=true   → Chrome runs headless (no display needed)
```

---

## What Happens

1. Node.js starts
2. Chrome launches in headless mode
3. Selenium controls Chrome to scrape news
4. Frontend calls backend and gets data ✅

Done! Simple and clean. 🎉
