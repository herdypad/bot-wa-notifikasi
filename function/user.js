const { Utils } = require('../lib');
const { models } = require('../database');

class UserService {
    async getUserByNama(nama) {
        try {
            const user = await models.User.findOne({ nama });
            if (!user) {
                return Utils.createErrorResponse('User not found');
            }
            
            return Utils.createSuccessResponse('User found', user);
        } catch (error) {
            return Utils.createErrorResponse('Failed to get user', error.message);
        }
    }

    async getAllUsers() {
        try {
            const users = await models.User.find({});
            return Utils.createSuccessResponse('Users retrieved', users);
        } catch (error) {
            return Utils.createErrorResponse('Failed to get users', error.message);
        }
    }

    async checkUserExpiration(nama) {
        try {
            const user = await models.User.findOne({ nama });
            if (!user) {
                return Utils.createErrorResponse('User not found');
            }

            // Parse end date (format: YYYYMMDD)
            const endDate = new Date(
                user.end.substring(0, 4), // year
                parseInt(user.end.substring(4, 6)) - 1, // month (0-indexed)
                user.end.substring(6, 8) // day
            );

            const currentDate = new Date();
            const isExpired = currentDate > endDate;
            const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));

            return Utils.createSuccessResponse('User expiration checked', {
                user,
                endDate: endDate.toISOString(),
                isExpired,
                daysRemaining: isExpired ? 0 : daysRemaining
            });
        } catch (error) {
            return Utils.createErrorResponse('Failed to check user expiration', error.message);
        }
    }

    async createUser(nama, endDate) {
        try {
            // Format end date as YYYYMMDD
            const formattedEndDate = endDate.replace(/[-\/]/g, '');
            
            const user = new models.User({
                nama,
                end: formattedEndDate
            });

            await user.save();
            return Utils.createSuccessResponse('User created', user);
        } catch (error) {
            return Utils.createErrorResponse('Failed to create user', error.message);
        }
    }

    async updateUserExpiration(nama, newEndDate) {
        try {
            // Format end date as YYYYMMDD
            const formattedEndDate = newEndDate.replace(/[-\/]/g, '');
            
            const user = await models.User.findOneAndUpdate(
                { nama },
                { end: formattedEndDate },
                { new: true }
            );

            if (!user) {
                return Utils.createErrorResponse('User not found');
            }

            return Utils.createSuccessResponse('User expiration updated', user);
        } catch (error) {
            return Utils.createErrorResponse('Failed to update user expiration', error.message);
        }
    }

    async isUserActive(phoneNumber) {
        try {
            // Normalize phone number untuk pencarian
            const normalizedPhone = Utils.normalizePhoneNumber(phoneNumber);
            
            const user = await models.User.findOne({ nama: normalizedPhone });
            if (!user) {
                return false;
            }

            const expirationCheck = await this.checkUserExpiration(normalizedPhone);
            if (expirationCheck.status === 'error') {
                return false;
            }

            return !expirationCheck.data.isExpired;
        } catch (error) {
            console.error('❌ Error checking user active status:', error);
            return false;
        }
    }
}

module.exports = UserService;
