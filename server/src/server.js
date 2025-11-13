require('dotenv').config(); // Load environment variables
const http = require('http');
const app = require('./app');
const { loadPlanetsData } = require('./models/planets.models');
const { mongoConnect } = require('./services/mongo'); // Import  mongo module
const { loadLaunchData } = require('./models/launches.models');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoConnect(); // Use separate mongo module
    // Load planets data after successful connection
    await loadPlanetsData();
    await loadLaunchData();
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error starting server:', err);
  }
}

startServer();

module.exports = server;
