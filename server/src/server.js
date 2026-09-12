const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB().then(() => {
  const cache = require('./config/cache');
  cache.flush();

  const server = app.listen(config.port, () => {
    console.log(`\n==============================================`);
    console.log(`  NewsHub API Server running on port ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Health Check: http://localhost:${config.port}/api/health`);
    console.log(`==============================================\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server.');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  });
});
