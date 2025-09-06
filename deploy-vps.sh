#!/bin/bash

# WhatsApp API VPS Deploy Script
set -e

echo "🚀 Deploying WhatsApp API to VPS..."

# Install Node.js if not installed
echo "📦 Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found, installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installed successfully"
else
    current_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$current_version" -lt 20 ]; then
        echo "Upgrading Node.js from v$(node --version) to v20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        echo "✅ Node.js upgraded successfully"
    else
        echo "✅ Node.js already installed: $(node --version)"
    fi
fi

# Install PM2 globally if not installed
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    sudo npm install -g pm2
    echo "✅ PM2 installed successfully"
else
    echo "✅ PM2 already installed: $(pm2 --version)"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install
echo "✅ Dependencies installed successfully"

# Stop existing PM2 process if running
echo "🔄 Stopping existing PM2 processes..."
pm2 stop wa-api 2>/dev/null || true
pm2 delete wa-api 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting WhatsApp API with PM2..."
pm2 start app.js --name wa-api

# Save PM2 process list
echo "💾 Saving PM2 process list..."
pm2 save

echo "✅ Deployment completed!"
echo ""
echo "🎉 WhatsApp API is now running with PM2!"
echo ""
echo "📊 Monitor with PM2:"
echo "  pm2 status"
echo "  pm2 logs wa-api"
echo "  pm2 restart wa-api"
echo "  pm2 stop wa-api"
