module.exports = {
  apps: [{
    name: 'wa-api',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PORT: 80,
      NODE_ENV: 'production'
    }
  }]
};
