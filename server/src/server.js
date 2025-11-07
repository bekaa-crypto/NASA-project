const http = require("http");
const app = require("./app");
const { loadPlanetsData } = require("./models/planets.models");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
  await loadPlanetsData(); // Load planets before starting server

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

module.exports = server;