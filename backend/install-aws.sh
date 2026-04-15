#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AWS EC2 One-Time Setup Script for UP News Tracker
# Run this ONCE on a fresh EC2 Ubuntu/Amazon Linux instance:
#   chmod +x install-aws.sh && sudo bash install-aws.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e
echo "=========================================="
echo " UP Tracker — AWS EC2 Setup"
echo "=========================================="

# ── 1. System update ─────────────────────────────────────────────────────────
echo "[1/6] Updating system packages..."
apt-get update -y

# ── 2. Install Node.js 20 ────────────────────────────────────────────────────
echo "[2/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── 3. Install Google Chrome ─────────────────────────────────────────────────
echo "[3/6] Installing Google Chrome..."
wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt-get install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb
echo "Chrome version: $(google-chrome --version)"

# ── 4. Install Xvfb (Virtual Display) ───────────────────────────────────────
echo "[4/6] Installing Xvfb (virtual display)..."
apt-get install -y xvfb x11-utils

# ── 5. Install required fonts for rendering ──────────────────────────────────
echo "[5/6] Installing fonts..."
apt-get install -y \
  fonts-liberation \
  fonts-noto \
  fonts-noto-cjk \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libgbm1 \
  libasound2

# ── 6. Create Xvfb systemd service (auto-starts on reboot) ───────────────────
echo "[6/6] Setting up Xvfb as a system service..."
cat > /etc/systemd/system/xvfb.service << 'EOF'
[Unit]
Description=Xvfb Virtual Display
After=network.target

[Service]
ExecStart=/usr/bin/Xvfb :99 -screen 0 1366x768x24 -ac +extension GLX +render -noreset
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable xvfb
systemctl start xvfb

echo ""
echo "=========================================="
echo " ✅ Setup complete!"
echo " Chrome: $(google-chrome --version)"
echo " Xvfb:   running on display :99"
echo "=========================================="
echo ""
echo " Next steps:"
echo "  1. cd into your project folder"
echo "  2. npm install"
echo "  3. cp .env.example .env  (edit FRONTEND_URL)"
echo "  4. bash start.sh          (to start the app)"
echo ""
