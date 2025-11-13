const express = require("express");


const planetRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.routes");

const api= express.Router();
// API Routes with /v1 prefix
api.use("/planets", planetRouter);
api.use("/launches", launchesRouter);

module.exports = api;