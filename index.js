const express = require('express');
const { WhatsAppClient, Config } = require('./lib');
const { connection: dbConnection } = require('./database');
const { MessageService, WebhookService, UserService } = require('./function');

const app = express();
app.use(express.json());

// Initialize services
let whatsappClient;
let messageService;
let webhookService;
let userService;

async function initializeApp() {
    try {
        console.log('🌟 Starting WhatsApp Notification API...');
        console.log('📂 Current working directory:', __dirname);
        console.log('📋 App Name:', Config.getAppName());
        console.log('📊 Database:', Config.getDatabaseName());
        
        // Initialize database connection
        try {
            await dbConnection.connect();
        } catch (error) {
            console.log('⚠️ Database connection failed, continuing without database');
        }

        // Initialize WhatsApp client
        whatsappClient = new WhatsAppClient();
        await whatsappClient.initialize();

        // Initialize services
        messageService = new MessageService(whatsappClient);
        webhookService = new WebhookService(messageService);
        userService = new UserService();

        console.log('✅ Application initialized successfully');

    } catch (error) {
        console.error('❌ Error initializing application:', error);
        process.exit(1);
    }
}

// Routes

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'WhatsApp Notification API is running',
        timestamp: new Date().toISOString()
    });
});

// Status check endpoint
app.get('/status', (req, res) => {
    const whatsappStatus = whatsappClient ? whatsappClient.getStatus() : { isReady: false, hasQR: false };
    const dbStatus = dbConnection ? dbConnection.getStatus() : { connected: false };
    
    res.json({
        status: 'ok',
        whatsapp: whatsappStatus,
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// Login endpoint with QR scan
app.get('/login', (req, res) => {
    if (!whatsappClient) {
        return res.status(500).send(`
            <html>
            <body>
            <h2>❌ WhatsApp Client Not Initialized</h2>
            <p>Please wait for the application to fully start.</p>
            </body>
            </html>
        `);
    }

    const status = whatsappClient.getStatus();
    
    if (status.isReady) {
        return res.send(`
            <html>
            <head>
            <script>
                setTimeout(() => {
                    location.reload();
                }, 2000);
            </script>
            </head>
            <body>
            <h2>✅ WhatsApp is Ready!</h2>
            <p>You are successfully logged in to WhatsApp.</p>
            <p>You can now send messages through the API.</p>
            <a href="/status">Check Status</a>
            </body>
            </html>
        `);
    }
    
    if (status.qrCodeData) {
        return res.send(`
            <html>
            <head>
            <script>
                setTimeout(() => {
                    location.reload();
                }, 2000);
            </script>
            </head>
            <body>
            <h2>Scan QR Code to Login</h2>
            <img src="${status.qrCodeData}" alt="QR Code" style="max-width: 512px;" />
            <p>Refresh the page if QR code doesn't update</p>
            <p>Page will auto-refresh every 2 seconds</p>
            </body>
            </html>
        `);
    }
    
    return res.send(`
        <html>
        <head>
        <script>
            setTimeout(() => {
                location.reload();
            }, 1000);
        </script>
        </head>
        <body>
        <h2>Initializing WhatsApp Connection...</h2>
        <p>Waiting for QR code...</p>
        <p>Page will refresh automatically</p>
        </body>
        </html>
    `);
});

// Logout endpoint
app.get('/logout', async (req, res) => {
    try {
        if (whatsappClient) {
            await whatsappClient.logout();
        }
        res.json({ status: 'logged_out' });
    } catch (error) {
        console.error('❌ Error during logout:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Lynk
app.post("/webhook/lynk/:phoneNumber/:merchantKey", async (req, res) => {

    // Check if phone number exists and is not expired
    const phoneNumber = req.params.phoneNumber;
    
    if (!userService) {
        return res.status(500).json({ error: 'User service not initialized' });
    }
    
    // Check if user exists and get their status
    const userCheck = await userService.getUserByNama(phoneNumber);
    
    if (userCheck.status === 'error' || !userCheck.data) {
        // User not found, send notification about registration
        const result = await messageService.sendNotification(phoneNumber, "Nomor Anda belum terdaftar. Silakan daftar terlebih dahulu untuk menggunakan layanan kami.", 'manual_send');
        if (result.status === 'error') {
            return res.status(500).json(result);
        }
        return res.json(result);
    }
    
    // Check if user is active (not expired)
    const isActive = await userService.isUserActive(phoneNumber);
    if (!isActive) {
        // Send notification about expired subscription
        const result = await messageService.sendNotification(phoneNumber, "Langganan Anda telah berakhir. Silakan perpanjang untuk melanjutkan menggunakan layanan kami.", 'manual_send');
        if (result.status === 'error') {
            return res.status(500).json(result);
        }
        return res.json(result);
    }

    if (!webhookService) {
        return res.status(500).json({ error: 'Webhook service not initialized' });
    }
    
    return await webhookService.processLynkWebhook(req, res);
});

// Send message endpoint
app.get('/send', async (req, res) => {
    const number = req.query.nm;
    const message = req.query.m;
    
    if (!messageService) {
        return res.status(500).json({ error: 'Message service not initialized' });
    }
    
    if (!number || !message) {
        return res.status(400).json({ error: 'nm and m query parameters required' });
    }
    
    const result = await messageService.sendNotification(number, message, 'manual_send');
    
    if (result.status === 'error') {
        return res.status(500).json(result);
    }
    
    res.json(result);
});

// Redirect URL endpoint
app.get('/redirect', async (req, res) => {
    const url = req.query.url || 'wa.link/5g7b1o';
    const number = Config.getDefaultNumber();
    const message = Config.getDefaultMessage();

    if (messageService) {
        try {
            await messageService.sendNotification(number, message, 'redirect');
        } catch (err) {
            console.error('❌ Error sending redirect message:', err);
        }
    }
    
    const redirectUrl = url.startsWith('http') ? url : `https://${url}`;
    res.send(`
        <html>
        <head>
            <meta http-equiv="refresh" content="2;url=${redirectUrl}">
            <title>Redirecting...</title>
        </head>
        <body>
            <h2>Order Sent Successfully!</h2>
            <p>You will be redirected to <a href="${redirectUrl}">${url}</a> in 2 seconds...</p>
            <p>If not redirected automatically, <a href="${redirectUrl}">click here</a></p>
        </body>
        </html>
    `);
});

// Message history endpoint
app.get('/messages', async (req, res) => {
    if (!messageService) {
        return res.status(500).json({ error: 'Message service not initialized' });
    }
    
    const phoneNumber = req.query.phone;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await messageService.getMessageHistory(phoneNumber, limit);
    res.json(result);
});

// User endpoints
app.get('/users', async (req, res) => {
    if (!userService) {
        return res.status(500).json({ error: 'User service not initialized' });
    }
    
    const result = await userService.getAllUsers();
    res.json(result);
});

app.get('/user/:nama', async (req, res) => {
    if (!userService) {
        return res.status(500).json({ error: 'User service not initialized' });
    }
    
    const result = await userService.getUserByNama(req.params.nama);
    res.json(result);
});

app.get('/user/:nama/check-expiration', async (req, res) => {
    if (!userService) {
        return res.status(500).json({ error: 'User service not initialized' });
    }
    
    const result = await userService.checkUserExpiration(req.params.nama);
    res.json(result);
});

app.post('/user', async (req, res) => {
    if (!userService) {
        return res.status(500).json({ error: 'User service not initialized' });
    }
    
    const { nama, endDate } = req.body;
    
    if (!nama || !endDate) {
        return res.status(400).json({ error: 'nama and endDate are required' });
    }
    
    const result = await userService.createUser(nama, endDate);
    res.json(result);
});

app.put('/user/:nama', async (req, res) => {
    if (!userService) {
        return res.status(500).json({ error: 'User service not initialized' });
    }
    
    const { endDate } = req.body;
    
    if (!endDate) {
        return res.status(400).json({ error: 'endDate is required' });
    }
    
    const result = await userService.updateUserExpiration(req.params.nama, endDate);
    res.json(result);
});

// Configuration endpoints
app.get('/config', (req, res) => {
    // Return config without sensitive information
    const config = Config.getAll();
    const safeConfig = {
        ...config,
        database: {
            ...config.database,
            url: config.database.url ? '***HIDDEN***' : undefined
        }
    };
    res.json({
        status: 'success',
        message: 'Configuration retrieved',
        data: safeConfig
    });
});

app.get('/config/:section', (req, res) => {
    const section = req.params.section;
    let data;
    
    switch (section) {
        case 'database':
            data = {
                name: Config.getDatabaseName(),
                cluster: Config.get('database.cluster'),
                username: Config.get('database.username')
            };
            break;
        case 'app':
            data = Config.getApp();
            break;
        case 'whatsapp':
            data = Config.getWhatsApp();
            break;
        default:
            return res.status(404).json({
                status: 'error',
                message: 'Configuration section not found'
            });
    }
    
    res.json({
        status: 'success',
        message: `${section} configuration retrieved`,
        data
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    
    if (whatsappClient) {
        try {
            await whatsappClient.logout();
        } catch (error) {
            console.error('❌ Error during WhatsApp logout:', error);
        }
    }
    
    if (dbConnection) {
        try {
            await dbConnection.disconnect();
        } catch (error) {
            console.error('❌ Error disconnecting from database:', error);
        }
    }
    
    process.exit(0);
});

// Start server
const PORT = Config.getPort();

app.listen(PORT, async () => {
    console.log(`🚀 ${Config.getAppName()} is running on port ${PORT}`);
    console.log(`📡 Access login at: http://localhost:${PORT}/login`);
    console.log(`📊 Check status at: http://localhost:${PORT}/status`);
    console.log(`📤 Send message: http://localhost:${PORT}/send?nm=NUMBER&m=MESSAGE`);
    console.log(`📋 Message history: http://localhost:${PORT}/messages`);
    console.log(`👥 Users list: http://localhost:${PORT}/users`);
    console.log(`👤 User details: http://localhost:${PORT}/user/{nama}`);
    console.log(`⏰ Check expiration: http://localhost:${PORT}/user/{nama}/check-expiration`);
    console.log(`🗃️ Database: ${Config.getDatabaseName()} (MongoDB Atlas)`);
    console.log(`👤 Owner Bot: ${Config.getOwnerBot()}`);
    console.log('===============================================');
    
    // Initialize application after server starts
    await initializeApp();
});
