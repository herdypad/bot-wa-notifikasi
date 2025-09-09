const fs = require('fs');
const path = require('path');

class Config {
    constructor() {
        this.config = null;
        this.loadConfig();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config.json');
            const configFile = fs.readFileSync(configPath, 'utf8');
            this.config = JSON.parse(configFile);
            console.log('✅ Configuration loaded successfully');
        } catch (error) {
            console.error('❌ Error loading config.json:', error);
            throw new Error('Failed to load configuration');
        }
    }

    get(key) {
        if (!this.config) {
            throw new Error('Configuration not loaded');
        }

        // Support dot notation for nested keys (e.g., 'database.url')
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    getDatabase() {
        return this.get('database') || {};
    }

    getApp() {
        return this.get('app') || {};
    }

    getWhatsApp() {
        return this.get('whatsapp') || {};
    }

    getOwnerBot() {
        return this.get('ownerBot');
    }

    // Database specific getters
    getDatabaseUrl() {
        return this.get('database.url') || 'mongodb://localhost:27017/wauser';
    }

    getDatabaseName() {
        return this.get('database.name') || 'wauser';
    }

    // App specific getters
    getPort() {
        return this.get('app.port') || 80;
    }

    getAppName() {
        return this.get('app.name') || 'WhatsApp Notification API';
    }

    // WhatsApp specific getters
    getAuthPath() {
        return this.get('whatsapp.authPath') || './auth_info_baileys';
    }

    getDefaultNumber() {
        return this.get('whatsapp.defaultNumber') || '6282217417425';
    }

    getDefaultMessage() {
        return this.get('whatsapp.defaultMessage') || 'hallo_ada_orderan_dari_lynk';
    }

    // Utility method to check if config is valid
    isValid() {
        return this.config !== null && typeof this.config === 'object';
    }

    // Method to reload config
    reload() {
        this.loadConfig();
    }

    // Method to get all config
    getAll() {
        return this.config;
    }
}

// Export singleton instance
module.exports = new Config();
