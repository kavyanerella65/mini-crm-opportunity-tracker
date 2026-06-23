require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[server] Missing required environment variable(s): ${missing.join(', ')}`);
  console.error('[server] Copy .env.example to .env and fill in the values before starting the server.');
  process.exit(1);
}

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server] Mini CRM API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
