#!/bin/bash

# WhatsApp API VPS Deploy Script
set -e

echo "🚀 Deploying WhatsApp API to VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Clone or update repository
PROJECT_DIR="bot-wa-notifikasi"
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 Project exists, updating..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo "📁 Cloning repository..."
    git clone https://github.com/herdypad/bot-wa-notifikasi.git
    cd "$PROJECT_DIR"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Stop existing PM2 process if running
pm2 stop wa-api 2>/dev/null || true
pm2 delete wa-api 2>/dev/null || true

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'wa-api',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PORT: 80,
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start application with PM2
echo "🚀 Starting WhatsApp API with PM2..."
sudo pm2 start ecosystem.config.js

# Setup PM2 startup script
echo "⚙️ Setting up PM2 auto-startup..."
sudo pm2 startup systemd -u $USER --hp $HOME
sudo pm2 save

# Setup firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

echo "✅ Deployment completed!"
echo ""
echo "🎉 WhatsApp API is now running!"
echo ""
echo "🌐 Access your API at: http://YOUR_VPS_IP"
echo "📱 Login endpoint: http://YOUR_VPS_IP/login"
echo "📤 Send message: http://YOUR_VPS_IP/send?nm=NUMBER&m=MESSAGE"
echo ""
echo "📊 Monitor with PM2:"
echo "  pm2 status"
echo "  pm2 logs wa-api"
echo "  pm2 restart wa-api"
echo ""
echo "🔄 To update code later:"
echo "  cd bot-wa-notifikasi"
echo "  git pull"
echo "  pm2 restart wa-api"
