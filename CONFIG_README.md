# WhatsApp Notification API

API untuk mengirim notifikasi WhatsApp dengan integrasi database MongoDB Atlas.

## Struktur Proyek

```
├── index.js              # File utama aplikasi
├── config.json           # Konfigurasi aplikasi
├── lib/                  # Library utama
│   ├── whatsapp.js       # WhatsApp client handler
│   ├── utils.js          # Utility functions
│   ├── config.js         # Configuration loader
│   └── index.js          # Lib exports
├── database/             # Database configurations
│   ├── connection.js     # MongoDB connection
│   ├── models.js         # Mongoose models
│   └── index.js          # Database exports
├── function/             # Business logic
│   ├── message.js        # Message service
│   ├── webhook.js        # Webhook service
│   ├── user.js           # User service
│   └── index.js          # Function exports
└── auth_info_baileys/    # WhatsApp session data
```

## Konfigurasi (config.json)

```json
{
    "ownerBot": "628221741425",
    "database": {
        "url": "mongodb+srv://username:password@cluster.mongodb.net/database",
        "name": "wauser",
        "username": "kodeidshop",
        "cluster": "cluster0.bffrrlc.mongodb.net"
    },
    "app": {
        "port": 80,
        "name": "WhatsApp Notification API",
        "version": "1.0.0"
    },
    "whatsapp": {
        "authPath": "./auth_info_baileys",
        "defaultNumber": "6282217417425",
        "defaultMessage": "hallo_ada_orderan_dari_lynk"
    }
}
```

## Database Schema

### Collection: user
```javascript
{
    "_id": ObjectId,
    "nama": "6282217417425",  // Phone number
    "end": "20250812"         // End date (YYYYMMDD format)
}
```

## API Endpoints

### WhatsApp Management
- `GET /login` - Login page dengan QR code
- `GET /logout` - Logout WhatsApp
- `GET /status` - Status aplikasi dan koneksi
- `GET /send?nm=NUMBER&m=MESSAGE` - Kirim pesan manual

### User Management
- `GET /users` - Daftar semua user
- `GET /user/:nama` - Detail user berdasarkan nama (phone number)
- `GET /user/:nama/check-expiration` - Cek masa berlaku user
- `POST /user` - Buat user baru (body: {nama, endDate})
- `PUT /user/:nama` - Update masa berlaku user (body: {endDate})

### Webhook
- `POST /webhook/lynk/:phoneNumber/:merchantKey` - Webhook endpoint untuk Lynk

### Configuration
- `GET /config` - Lihat konfigurasi (sensitive data disembunyikan)
- `GET /config/:section` - Lihat konfigurasi section tertentu (database, app, whatsapp)

### Message History
- `GET /messages` - Riwayat pesan
- `GET /messages?phone=NUMBER` - Riwayat pesan untuk nomor tertentu

## Menjalankan Aplikasi

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update konfigurasi di `config.json`:
   - Ganti `YOUR_PASSWORD` dengan password MongoDB Atlas yang sebenarnya
   - Sesuaikan konfigurasi lain sesuai kebutuhan

3. Jalankan aplikasi:
   ```bash
   node index.js
   ```

4. Akses login page di: `http://localhost:80/login`

## Fitur

- ✅ WhatsApp client dengan Baileys
- ✅ MongoDB Atlas integration
- ✅ User management dengan masa berlaku
- ✅ Webhook untuk Lynk payment
- ✅ Message history logging
- ✅ Configuration management
- ✅ Modular code structure
- ✅ Error handling
- ✅ Graceful shutdown
