# WhatsApp Notification Bot API

A WhatsApp notification bot API for sending messages programmatically using Baileys library. This bot can receive webhooks and automatically send WhatsApp notifications.

## Features

- 🚀 WhatsApp Web API integration with Baileys
- 📱 QR Code authentication
- 🔔 Webhook support for external services (Lynk, etc.)
- 💰 Payment notification handling
- 🎯 Dynamic phone number and merchant key routing
- 🔐 Signature validation for security
- 📊 Real-time status monitoring
- 🔄 Auto-reconnection on disconnect

## Installation

### Prerequisites
- Node.js 20.x or higher
- NPM package manager

### Step 1: Install Node.js 20
```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# For macOS with Homebrew
brew install node@20

# Verify installation
node --version  # Should show v20.x.x
```

### Step 2: Install Dependencies
```bash
npm install express crypto-js @whiskeysockets/baileys qrcode pino
```

### Step 3: Run the Application
```bash
# Development
node app2.js

# Production with PM2
npm install -g pm2
pm2 start app2.js --name wa-notif-bot
```

## API Documentation

### Base URL
```
http://localhost:80
```
*Note: Default port is 80, can be changed with PORT environment variable*

---

## Endpoints

### 1. Login & Authentication

#### **GET** `/login`
Scan QR code to authenticate WhatsApp Web session.

**Response:** HTML page with QR code or login status

**Example:**
```
http://localhost:80/login
```

---

#### **GET** `/logout`
Logout from WhatsApp and clear session data.

**Response:**
```json
{
    "status": "logged_out"
}
```

---

### 2. Status & Monitoring

#### **GET** `/status`
Check WhatsApp connection status.

**Response:**
```json
{
    "status": "ok",
    "whatsapp_ready": true,
    "has_qr": false
}
```

---

### 3. Send Messages

#### **GET** `/send`
Send WhatsApp message to specific number.

**Parameters:**
- `nm` (required): Phone number (e.g., 6282217417425)
- `m` (required): Message content

**Example:**
```
http://localhost:80/send?nm=6282217417425&m=Hello%20World
```

**Response:**
```json
{
    "status": "sent",
    "number": "6282217417425",
    "message": "Hello World"
}
```

---

### 4. Webhook Endpoints

#### **POST** `/webhook/lynk/:phoneNumber/:merchantKey`
Receive webhooks from external services (like Lynk payment gateway).

**URL Parameters:**
- `phoneNumber`: WhatsApp number to send notifications (e.g., 628817417425)
- `merchantKey`: Merchant key for signature validation

**URL Format:**
```
http://localhost:80/webhook/lynk/628817417425/ynic9rerpv15UEbBgrA79rF4rYj-qJX4
```

**Supported Events:**
- `payment.received` - Payment notifications
- `test_event` - Test notifications
- `*` - Any other event (sends raw data)

**Headers (Optional):**
- `X-Lynk-Signature`: Signature for validation
- `X-Signature`: Alternative signature header
- `Signature`: Another signature header format

**Request Body Examples:**

**Payment Event:**
```json
{
    "event": "payment.received",
    "data": {
        "message_data": {
            "refId": "REF123456",
            "totals": {
                "grandTotal": 150000
            },
            "customer": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "08123456789"
            },
            "createdAt": "2024-01-01T10:00:00Z"
        },
        "message_id": "MSG123"
    }
}
```

**Test Event:**
```json
{
    "event": "test_event",
    "data": {
        "message": "This is a test webhook",
        "timestamp": 1757312507378
    }
}
```

**Response:**
```json
{
    "status": "ok",
    "message": "Webhook processed successfully for event: payment.received",
    "event": "payment.received",
    "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

### 5. Redirect Handler

#### **GET** `/redirect`
Handle order redirects and send notifications.

**Parameters:**
- `url` (optional): Redirect URL (default: wa.link/5g7b1o)

**Example:**
```
http://localhost:80/redirect?url=https://example.com/order/123
```

**Response:** HTML redirect page with notification sent

---

## WhatsApp Message Formats

### Payment Notification
```
🎉 PEMBAYARAN DITERIMA!

💰 Jumlah: Rp 150.000
📋 Ref ID: REF123456
👤 Customer: John Doe
📧 Email: john@example.com
📱 Phone: 08123456789
⏰ Waktu: 2024-01-01T10:00:00Z
```

### Test Notification
```
🧪 TEST WEBHOOK BERHASIL!

📋 Event: test_event
💬 Message: This is a test webhook
⏰ Timestamp: 08/01/2024 17:00:00
```

### Generic Event
```
📨 WEBHOOK EVENT: order.created

📄 Data:
{
  "order_id": "12345",
  "customer": "Jane Doe",
  "amount": 100000
}

⏰ Received: 08/01/2024 17:00:00
```

---

## Security

### Signature Validation
For `payment.received` events, signatures are validated using SHA256:

```
signature = SHA256(grandTotal + refId + message_id + merchantKey)
```

**Signature Headers (in order of priority):**
1. `X-Lynk-Signature`
2. `X-Signature` 
3. `Signature`
4. `body.signature`

---

## Configuration

### Environment Variables
```bash
PORT=80                    # Server port (default: 80)
```

### File Structure
```
project/
├── app2.js              # Main application
├── auth_info_baileys/    # WhatsApp session data (auto-generated)
├── package.json          # Dependencies
└── README.md            # This documentation
```

---

## Production Deployment

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start app2.js --name wa-notif-bot

# Monitor
pm2 monit

# Auto-start on boot
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD ["node", "app2.js"]
```

---

## Testing

### Test Webhook
```bash
curl -X POST http://localhost:80/webhook/lynk/628817417425/test-merchant-key \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test_event",
    "data": {
      "message": "Test notification",
      "timestamp": 1757312507378
    }
  }'
```

### Test Send Message
```bash
curl "http://localhost:80/send?nm=628817417425&m=Hello%20from%20API"
```

---

## Troubleshooting

### Common Issues

1. **WhatsApp not ready**
   - Visit `/login` to scan QR code
   - Check `/status` for connection status

2. **Messages not sending**
   - Ensure phone number format is correct (e.g., 628817417425)
   - Check WhatsApp connection status

3. **Webhook not receiving**
   - Verify URL format: `/webhook/lynk/PHONE/MERCHANTKEY`
   - Check request headers and body format

4. **Signature validation failed**
   - Ensure merchant key matches
   - Check signature calculation method

### Logs
Application logs include emojis for easy identification:
- 🚀 Startup messages
- 📱 WhatsApp events
- 📥 Webhook received
- ✅ Success operations
- ❌ Error messages
- ⚠️ Warning messages

---

## Support

For issues and questions:
- Check logs for error messages
- Verify WhatsApp connection status
- Test with simple webhook events first
- Ensure proper URL parameter format

## License

This project is for educational and business use. Please comply with WhatsApp's Terms of Service when using this bot.