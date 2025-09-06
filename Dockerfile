FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p auth_info_baileys .wwebjs_auth

EXPOSE 3000
EXPOSE 3001

# Default to app.js, but can be overridden
CMD ["node", "app.js"]
