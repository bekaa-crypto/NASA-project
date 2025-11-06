const express = require("express");
const { getAllPlanets } = require("./planets.controller");

const planetRouter = express.Router();

// Note: use "/" here, NOT "/planets"
planetRouter.get("/", getAllPlanets);

module.exports = planetRouter;
