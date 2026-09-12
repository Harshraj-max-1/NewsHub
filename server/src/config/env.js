const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/newshub',
  jwtSecret: process.env.JWT_SECRET || 'newshub_dev_jwt_secret_key_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cacheTtl: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 600, // 10 mins
  newsApiKeys: {
    gnews: process.env.GNEWS_API_KEY || '',
    newsApi: process.env.NEWS_API_KEY || '',
    newsData: process.env.NEWSDATA_API_KEY || ''
  }
};

module.exports = config;
