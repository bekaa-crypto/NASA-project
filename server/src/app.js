const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const api= require("./routes/api");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));


// API Routes
app.use("/v1", api);


// Root
app.get("/", (req, res) => {
  res.send("NASA Project API is running!");
});

// Catch-all for React SPA
// Use '*' instead of '/*' to avoid path-to-regexp parameter parsing errors
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
