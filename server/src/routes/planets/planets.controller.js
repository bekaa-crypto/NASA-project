const { getAllPlanets } = require("../../models/planets.models");

// Helper: convert snake_case keys to camelCase for top-level properties
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase());
}

function normalizePlanet(planet) {
  const normalized = {};
  Object.keys(planet).forEach((key) => {
    const camel = toCamelCase(key);
    normalized[camel] = planet[key];
  });
  return normalized;
}

async function httpGetAllPlanets(req, res) {
 return res
    .status(200)
    .json((await getAllPlanets()).map((planet) => normalizePlanet(planet)));
}

module.exports = { httpGetAllPlanets };
