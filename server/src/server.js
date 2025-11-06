const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 5000; // 5000 matches your start script

const server = http.createServer(app);

// Listen on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
