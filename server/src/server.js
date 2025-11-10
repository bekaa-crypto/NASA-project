require('dotenv').config(); // Load environment variables from .env
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { loadPlanetsData } = require('./models/planets.models');

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);

// Database connection events
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Load planets data after successful connection
    await loadPlanetsData();

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
