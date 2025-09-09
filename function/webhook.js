const { Utils } = require('../lib');
const { models } = require('../database');

class WebhookService {
    constructor(messageService) {
        this.messageService = messageService;
    }

    async processLynkWebhook(req, res) {
        try {
            Utils.logRequest(req, 'Webhook received from Lynk');
            
            // Ambil phone number dan merchant key dari URL parameter
            const phoneNumber = req.params.phoneNumber;
            const merchantKey = req.params.merchantKey;
            
            console.log('📱 Phone Number from URL:', phoneNumber);
            console.log('🔑 Merchant Key from URL:', merchantKey);
            
            // Ambil signature dari header
            const receivedSignature = req.headers['x-lynk-signature'] || 
                                     req.headers['x-signature'] || 
                                     req.headers['signature'] ||
                                     req.body.signature;
            
            // Log semua kemungkinan signature untuk debugging
            console.log('🔍 Checking signatures:');
            console.log('- x-lynk-signature:', req.headers['x-lynk-signature']);
            console.log('- x-signature:', req.headers['x-signature']);
            console.log('- signature:', req.headers['signature']);
            console.log('- body.signature:', req.body.signature);

            const { event, data } = req.body;
            console.log(`📋 Processing event: ${event}`);

            // Format pesan berdasarkan jenis event
            let message = '';
            if (event === 'payment.received') {
                message = this.messageService.formatPaymentMessage(data);
                
                // Validasi signature untuk payment.received
                if (receivedSignature) {
                    const isValidSignature = this.validatePaymentSignature(
                        receivedSignature, data, merchantKey
                    );
                    
                    if (!isValidSignature) {
                        console.error("❌ Invalid signature");
                        return res.status(401).json({ 
                            error: "Unauthorized: Invalid signature" 
                        });
                    }
                    console.log('✅ Signature validated successfully');
                }
            } else if (event === 'test_event') {
                message = this.messageService.formatTestMessage(data);
            } else {
                message = this.messageService.formatGenericMessage(event, data);
            }

            // Kirim notifikasi WhatsApp
            const result = await this.messageService.sendNotification(
                phoneNumber, 
                message, 
                event, 
                req.body
            );

            if (result.status === 'error') {
                console.log('⚠️ WhatsApp not ready or send failed, but webhook processed');
            }

            // Response sukses
            return res.status(200).json({ 
                status: "ok", 
                message: `Webhook processed successfully for event: ${event}`,
                event: event,
                timestamp: new Date().toISOString()
            });

        } catch (err) {
            console.error("❌ Webhook error:", err.message);
            return res.status(500).json({ 
                error: "Internal server error",
                message: err.message 
            });
        }
    }

    validatePaymentSignature(receivedSignature, data, merchantKey) {
        try {
            const { message_data, message_id } = data;
            const { refId, totals } = message_data;
            const { grandTotal } = totals;

            return Utils.validateSignature(
                receivedSignature, 
                grandTotal, 
                refId, 
                message_id, 
                merchantKey
            );
        } catch (err) {
            console.log('⚠️ Error validating signature:', err.message);
            return false;
        }
    }

    async getWebhookConfig(phoneNumber) {
        try {
            const config = await models.WebhookConfig.findOne({ 
                phoneNumber: Utils.normalizePhoneNumber(phoneNumber) 
            });
            return config;
        } catch (error) {
            console.error('❌ Error getting webhook config:', error);
            return null;
        }
    }

    async saveWebhookConfig(phoneNumber, merchantKey, description = '') {
        try {
            const normalizedPhone = Utils.normalizePhoneNumber(phoneNumber);
            
            const config = await models.WebhookConfig.findOneAndUpdate(
                { phoneNumber: normalizedPhone },
                { 
                    merchantKey, 
                    description,
                    isActive: true 
                },
                { upsert: true, new: true }
            );

            return Utils.createSuccessResponse('Webhook config saved', config);
        } catch (error) {
            return Utils.createErrorResponse('Failed to save webhook config', error.message);
        }
    }
}

module.exports = WebhookService;
