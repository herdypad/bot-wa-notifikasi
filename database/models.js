const mongoose = require('mongoose');

// Schema untuk collection user (existing data)
const UserSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        index: true
    },
    end: {
        type: String,
        required: true
    }
}, {
    collection: 'user' // Explicit collection name
});

// Schema untuk menyimpan log pesan WhatsApp
const MessageLogSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['payment.received', 'test_event', 'manual_send', 'redirect', 'other']
    },
    status: {
        type: String,
        required: true,
        enum: ['sent', 'failed', 'pending'],
        default: 'pending'
    },
    webhookData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    error: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Schema untuk menyimpan konfigurasi webhook
const WebhookConfigSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    merchantKey: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Schema untuk menyimpan status koneksi WhatsApp
const WhatsAppStatusSchema = new mongoose.Schema({
    isReady: {
        type: Boolean,
        default: false
    },
    hasQR: {
        type: Boolean,
        default: false
    },
    lastConnected: {
        type: Date,
        default: null
    },
    lastDisconnected: {
        type: Date,
        default: null
    },
    connectionCount: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware untuk update timestamp
MessageLogSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

WebhookConfigSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

WhatsAppStatusSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Export models
const User = mongoose.model('User', UserSchema);
const MessageLog = mongoose.model('MessageLog', MessageLogSchema);
const WebhookConfig = mongoose.model('WebhookConfig', WebhookConfigSchema);
const WhatsAppStatus = mongoose.model('WhatsAppStatus', WhatsAppStatusSchema);

module.exports = {
    User,
    MessageLog,
    WebhookConfig,
    WhatsAppStatus
};
