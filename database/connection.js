const mongoose = require('mongoose');
const Config = require('../lib/config');

class DatabaseConnection {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        try {
            // MongoDB Atlas connection URL from config.json
            const mongoUrl = Config.getDatabaseUrl();
            const dbName = Config.getDatabaseName();
            
            console.log('🔌 Connecting to MongoDB Atlas...');
            console.log('📊 Database:', dbName);
            console.log('🌐 Cluster:', Config.get('database.cluster'));
            
            await mongoose.connect(mongoUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');
            
            // Event listeners untuk koneksi
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
                this.isConnected = true;
            });

        } catch (error) {
            console.error('❌ Error connecting to MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('🔌 MongoDB disconnected');
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    getStatus() {
        return {
            connected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }
}

module.exports = new DatabaseConnection();
