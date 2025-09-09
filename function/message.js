const { Utils } = require('../lib');
const { models } = require('../database');

class MessageService {
    constructor(whatsappClient) {
        this.whatsappClient = whatsappClient;
    }

    async sendNotification(phoneNumber, message, eventType = 'manual_send', webhookData = null) {
        try {
            // Normalize phone number
            const normalizedPhone = Utils.normalizePhoneNumber(phoneNumber);
            
            // Log message attempt
            const messageLog = new models.MessageLog({
                phoneNumber: normalizedPhone,
                message,
                eventType,
                webhookData,
                status: 'pending'
            });

            try {
                await this.whatsappClient.sendMessage(normalizedPhone, message);
                messageLog.status = 'sent';
                console.log(`✅ Message sent successfully to ${normalizedPhone}`);
            } catch (error) {
                messageLog.status = 'failed';
                messageLog.error = error.message;
                console.error(`❌ Failed to send message to ${normalizedPhone}:`, error);
                throw error;
            } finally {
                // Save log to database (jika database terhubung)
                try {
                    await messageLog.save();
                } catch (dbError) {
                    console.error('❌ Failed to save message log:', dbError);
                }
            }

            return Utils.createSuccessResponse('Message sent successfully', {
                phoneNumber: normalizedPhone,
                messageId: messageLog._id
            });

        } catch (error) {
            return Utils.createErrorResponse('Failed to send message', error.message);
        }
    }

    formatPaymentMessage(data) {
        try {
            const { message_data } = data;
            const { refId, totals, customer } = message_data;
            const { grandTotal } = totals;

            return `🎉 PEMBAYARAN DITERIMA!\n\n` +
                   `💰 Jumlah: Rp ${Utils.formatCurrency(grandTotal)}\n` +
                   `📋 Ref ID: ${refId}\n` +
                   `👤 Customer: ${customer.name}\n` +
                   `📧 Email: ${customer.email}\n` +
                   `📱 Phone: ${customer.phone}\n` +
                   `⏰ Waktu: ${Utils.formatDate(message_data.createdAt)}`;
        } catch (err) {
            return `🎉 PEMBAYARAN DITERIMA!\n\n` +
                   `📄 Raw Data: ${JSON.stringify(data, null, 2)}`;
        }
    }

    formatTestMessage(data) {
        return `🧪 TEST WEBHOOK BERHASIL!\n\n` +
               `📋 Event: test_event\n` +
               `💬 Message: ${data.message || 'No message'}\n` +
               `⏰ Timestamp: ${data.timestamp ? Utils.formatDate(data.timestamp) : Utils.formatDate(new Date())}`;
    }

    formatGenericMessage(event, data) {
        return `📨 WEBHOOK EVENT: ${event}\n\n` +
               `📄 Data:\n${JSON.stringify(data, null, 2)}\n\n` +
               `⏰ Received: ${Utils.formatDate(new Date())}`;
    }

    async getMessageHistory(phoneNumber = null, limit = 50) {
        try {
            const query = phoneNumber ? { phoneNumber: Utils.normalizePhoneNumber(phoneNumber) } : {};
            const messages = await models.MessageLog
                .find(query)
                .sort({ createdAt: -1 })
                .limit(limit);

            return Utils.createSuccessResponse('Message history retrieved', messages);
        } catch (error) {
            return Utils.createErrorResponse('Failed to get message history', error.message);
        }
    }
}

module.exports = MessageService;
