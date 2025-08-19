const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');


const app = express();
app.use(express.json());

let client;
let qrCodeData = null;
let isReady = false;

function initClient() {
    console.log('🚀 Initializing WhatsApp Client...');
    
    client = new Client({
        puppeteer: { headless: true,
            args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
         },
        authStrategy: new LocalAuth({ clientId: 'wa-session' })
    });

    console.log('📱 Setting up WhatsApp Client event listeners...');

    client.on('qr', (qr) => {
            console.log('📱 QR Code generated, ready for scanning');
            qrcode.toDataURL(qr, (err, url) => {
                qrCodeData = url;
                console.log('✅ QR Code converted to data URL');
            });
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp Client is ready!');
        isReady = true;
        qrCodeData = null;
    });

    client.on('auth_failure', () => {
        console.log('❌ Authentication failed');
        isReady = false;
        qrCodeData = null;
    });

    client.on('disconnected', () => {
        console.log('🔌 WhatsApp Client disconnected');
        isReady = false;
        qrCodeData = null;
    });

    console.log('⏳ Starting WhatsApp Client initialization...');
    client.initialize();
}

function saveBase64Image(base64Data, outputPath) {
    // base64Data format: "data:image/png;base64,...."
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image data');
    }
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(outputPath, buffer);
}

console.log('🌟 Starting WhatsApp Notification API...');
console.log('📂 Current working directory:', __dirname);
initClient();

// Endpoint untuk login dan scan QR
app.get('/login', (req, res) => {
    if (isReady) {
        return res.json({ status: 'already_logged_in' });
    }
    if (qrCodeData) {
        // console.log('QR RECEIVED', qrCodeData);
        // return res.json({ qr: qrCodeData });
        // saveBase64Image(qrCodeData, './qr.png');
        return res.send(`
            <html>
            <body>
                <h2>Scan QR Code to Login</h2>
                <img src="data:image/png;base64,${qrCodeData.split(',')[1]}" alt="QR Code" />
                <p>Refresh the page if QR code doesn't update</p>
            </body>
            </html>
        `);
        
    }
    return res.json({ status: 'waiting_for_qr' });
});

// Endpoint untuk logout dan hapus sesi
app.get('/logout', async (req, res) => {
    if (!isReady) {
        return res.json({ status: 'not_logged_in' });
    }
    await client.logout();
    // Hapus folder sesi
    try {
        fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
    } catch (e) {}
    isReady = false;
    qrCodeData = null;
    initClient();
    res.json({ status: 'logged_out' });
});

// cek server on
app.get('/status', (req, res) => {
    res.json({ status: 'ok' });
});

// Endpoint untuk kirim pesan
// contoh http://127.0.0.1:3000/send?nm=6282217417425&m=hallo
app.get('/send', async (req, res) => {
    const number = req.query.nm;
    const message = req.query.m;
    
    if (!isReady) {
        return res.status(400).json({ error: 'WhatsApp not ready' });
    }
    if (!number || !message) {
        return res.status(400).json({ error: 'nm and m query parameters required' });
    }
    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ status: 'sent', number, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`🚀 WhatsApp Notification API is running on port ${PORT}`);
    console.log(`📡 Access login at: http://localhost:${PORT}/login`);
    console.log(`📊 Check status at: http://localhost:${PORT}/status`);
    console.log(`📤 Send message: http://localhost:${PORT}/send?nm=NUMBER&m=MESSAGE`);
    console.log('===============================================');
});
