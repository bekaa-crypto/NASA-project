const express = require("express");
const { httpGetAllPlanets } = require("./planets.controller");

const planetRouter = express.Router();

// Root "/" because mounted on /v1/planets
planetRouter.get("/", httpGetAllPlanets);

module.exports = planetRouter;
