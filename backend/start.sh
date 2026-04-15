#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AWS Start Script — runs EVERY TIME you want to start the backend
# Usage:  bash start.sh
# Or set this as your process manager command (PM2 / systemd)
# ─────────────────────────────────────────────────────────────────────────────

echo "=========================================="
echo " UP Tracker — Starting Backend (AWS)"
echo "=========================================="

# ── Ensure Xvfb is running ───────────────────────────────────────────────────
if ! pgrep -x "Xvfb" > /dev/null; then
  echo "Starting Xvfb virtual display on :99..."
  Xvfb :99 -screen 0 1366x768x24 -ac +extension GLX +render -noreset &
  sleep 2
  echo "Xvfb started."
else
  echo "Xvfb already running."
fi

# ── Set DISPLAY so Chrome uses the virtual display ──────────────────────────
export DISPLAY=:99

echo "DISPLAY=$DISPLAY"
echo "Starting Node.js backend..."
echo ""

# ── Start the app ────────────────────────────────────────────────────────────
# Chrome will open on the virtual display — no real screen needed.
# Google sees a "real" non-headless browser → drastically reduces CAPTCHA.
node server.js
