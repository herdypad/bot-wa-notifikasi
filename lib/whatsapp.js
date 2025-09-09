const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const P = require('pino');
const Config = require('./config');

class WhatsAppClient {
    constructor() {
        this.sock = null;
        this.qrCodeData = null;
        this.isReady = false;
        this.authPath = Config.getAuthPath();
    }

    async initialize() {
        console.log('🚀 Initializing WhatsApp Client with Baileys...');
        
        try {
            // Use multi-file auth state for session management
            const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
            
            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: P({ level: 'silent' }), // Proper pino logger
            });

            console.log('📱 Setting up WhatsApp Client event listeners...');

            this.sock.ev.on('connection.update', (update) => {
                this.handleConnectionUpdate(update);
            });

            this.sock.ev.on('creds.update', saveCreds);

            console.log('⏳ Starting WhatsApp Client initialization...');
            
        } catch (error) {
            console.error('❌ Error initializing client:', error);
            setTimeout(() => this.initialize(), 5000); // Retry after 5 seconds
        }
    }

    handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 QR Code generated, ready for scanning');
            qrcode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('❌ Error generating QR code:', err);
                    return;
                }
                this.qrCodeData = url;
                console.log('✅ QR Code converted to data URL');
            });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔌 Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            
            this.isReady = false;
            this.qrCodeData = null;
            
            if (shouldReconnect) {
                this.initialize();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Client is ready!');
            this.isReady = true;
            this.qrCodeData = null;
        }
    }

    async sendMessage(phoneNumber, message) {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }

        try {
            const jid = phoneNumber.includes('@s.whatsapp.net') ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
            await this.sock.sendMessage(jid, { text: message });
            console.log(`✅ Message sent to ${phoneNumber}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }

    async logout() {
        try {
            if (this.sock) {
                await this.sock.logout();
            }
            
            // Remove auth folder
            const fs = require('fs');
            try {
                fs.rmSync(this.authPath, { recursive: true, force: true });
            } catch (e) {
                console.log('Auth folder already removed or not found');
            }
            
            this.isReady = false;
            this.qrCodeData = null;
            
            // Reinitialize client
            setTimeout(() => this.initialize(), 1000);
            
            return true;
        } catch (error) {
            console.error('❌ Error during logout:', error);
            throw error;
        }
    }

    getStatus() {
        return {
            isReady: this.isReady,
            hasQR: !!this.qrCodeData,
            qrCodeData: this.qrCodeData
        };
    }

    getQRCode() {
        return this.qrCodeData;
    }
}

module.exports = WhatsAppClient;
