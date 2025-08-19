#!/bin/bash

# WhatsApp API Installer Script
set -e

echo "🚀 Installing WhatsApp API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create project directory
PROJECT_DIR="wa_notif_api"
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 Directory $PROJECT_DIR already exists. Removing..."
    rm -rf "$PROJECT_DIR"
fi

echo "📁 Creating project directory..."
mkdir "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Initialize npm project
echo "📦 Initializing npm project..."
npm init -y

# Install dependencies
echo "📦 Installing dependencies..."
npm install whatsapp-web.js express qrcode

# Download main application file
echo "📄 Downloading application files..."
curl -fsSL https://raw.githubusercontent.com/yourusername/wa-api-installer/main/app.js -o app.js
curl -fsSL https://raw.githubusercontent.com/yourusername/wa-api-installer/main/.gitignore -o .gitignore

# Make sure files are executable
chmod +x app.js

echo "✅ Installation completed!"
echo ""
echo "🎉 WhatsApp API is ready!"
echo ""
echo "To start the API:"
echo "  cd $PROJECT_DIR"
echo "  node app.js"
echo ""
echo "API will run on: http://localhost:3000"
echo "Endpoints:"
echo "  GET  /login  - Login and scan QR"
echo "  GET  /logout - Logout"
echo "  POST /send   - Send message"
echo ""