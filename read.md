buatkan project whatsapp api
dengan packed https://github.com/pedroslopez/whatsapp-web.js

dimana fitur

1. login scan wa dan save sesion
2. logout dan delete sesion
3. send text to number

buatkan rest api

## Deploy to VPS

Untuk deploy ke VPS (Ubuntu/Debian), jalankan perintah ini di VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/herdypad/bot-wa-notifikasi/refs/heads/main/deploy-vps.sh | bash
```

Atau manual:

```bash
git clone https://github.com/herdypad/bot-wa-notifikasi.git
cd bot-wa-notifikasi
bash deploy-vps.sh

npm install --no-audit


sudo pm2 start ecosystem.config.js
```

## Endpoints

- `GET /login` - Login dan scan QR code
- `POST /logout` - Logout dan hapus sesi  
- `GET /send?nm=NUMBER&m=MESSAGE` - Kirim pesan

npm install whatsapp-web.js express qrcode
i % npm install crypto-js



jika errpr poperter


apt-get update
apt-get install -y \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libnss3 \
    libx11-xcb1



<!-- delate -->
rm -rf node_modules package-lock.json package.json 