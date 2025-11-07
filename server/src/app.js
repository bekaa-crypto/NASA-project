const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const planetRouter = require("./routes/planets/planets.router");
const launchesRouter = require("./routes/launches/launches.routes");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/planets", planetRouter);
app.use("/launches", launchesRouter);

// Root route
app.get("/", (req, res) => {
  res.send("NASA Project API is running!");
});

// Catch-all route for React SPA
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
