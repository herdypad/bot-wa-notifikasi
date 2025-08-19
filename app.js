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
    client = new Client({
        authStrategy: new LocalAuth({ clientId: 'wa-session' })
    });

    client.on('qr', (qr) => {
            qrcode.toDataURL(qr, (err, url) => {
                qrCodeData = url;
            });
    });

    client.on('ready', () => {
        isReady = true;
        qrCodeData = null;
    });

    client.on('auth_failure', () => {
        isReady = false;
        qrCodeData = null;
    });

    client.on('disconnected', () => {
        isReady = false;
        qrCodeData = null;
    });

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

initClient();

// Endpoint untuk login dan scan QR
app.get('/login', (req, res) => {
    if (isReady) {
        return res.json({ status: 'already_logged_in' });
    }
    if (qrCodeData) {
        // console.log('QR RECEIVED', qrCodeData);
        // return res.json({ qr: qrCodeData });
        saveBase64Image(qrCodeData, './qr.png');
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

// Endpoint untuk kirim pesan
app.post('/send', async (req, res) => {
    const { number, message } = req.body || {};
    if (!isReady) {
        return res.status(400).json({ error: 'WhatsApp not ready' });
    }
    if (!number || !message) {
        return res.status(400).json({ error: 'number and message required' });
    }
    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ status: 'sent', number, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
