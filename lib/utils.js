const fs = require('fs');

class Utils {
    static saveBase64Image(base64Data, outputPath) {
        const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image data');
        }
        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(outputPath, buffer);
    }

    static formatCurrency(amount, locale = 'id-ID') {
        return amount.toLocaleString(locale);
    }

    static formatDate(date, locale = 'id-ID') {
        return new Date(date).toLocaleString(locale);
    }

    static validatePhoneNumber(phoneNumber) {
        // Basic phone number validation (Indonesian format)
        const phoneRegex = /^(\+62|62|0)(\d{8,13})$/;
        return phoneRegex.test(phoneNumber);
    }

    static normalizePhoneNumber(phoneNumber) {
        // Normalize phone number to international format
        let normalized = phoneNumber.replace(/\D/g, ''); // Remove non-digits
        
        if (normalized.startsWith('0')) {
            normalized = '62' + normalized.substring(1);
        } else if (normalized.startsWith('62')) {
            // Already in correct format
        } else {
            normalized = '62' + normalized;
        }
        
        return normalized;
    }

    static generateSignature(grandTotal, refId, messageId, merchantKey) {
        const CryptoJS = require('crypto-js');
        const signatureString = grandTotal.toString() + refId + messageId + merchantKey;
        return CryptoJS.SHA256(signatureString).toString();
    }

    static validateSignature(receivedSignature, grandTotal, refId, messageId, merchantKey) {
        const calculatedSignature = this.generateSignature(grandTotal, refId, messageId, merchantKey);
        return calculatedSignature === receivedSignature;
    }

    static createSuccessResponse(message, data = null) {
        return {
            status: 'success',
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    static createErrorResponse(message, error = null) {
        return {
            status: 'error',
            message,
            error,
            timestamp: new Date().toISOString()
        };
    }

    static logRequest(req, description = '') {
        console.log(`📥 ${description}`);
        console.log('📋 Headers:', req.headers);
        console.log('📋 Body:', JSON.stringify(req.body, null, 2));
        console.log('📋 Params:', req.params);
        console.log('📋 Query:', req.query);
    }
}

module.exports = Utils;
