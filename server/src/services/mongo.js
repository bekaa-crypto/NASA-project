// ===============================
// 🛰️ mongo.js
// ===============================
const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

// MongoDB connection events
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connection ready!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Connect to MongoDB
async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

// Disconnect from MongoDB
async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect
};