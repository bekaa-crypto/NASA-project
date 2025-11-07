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

// API Routes with /v1 prefix
app.use("/v1/planets", planetRouter);
app.use("/v1/launches", launchesRouter);

// Convenience aliases (allow requests without the /v1 prefix and accept common typo)
app.use("/planets", planetRouter);
app.use("/launches", launchesRouter);
app.use("/launche", launchesRouter);


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
