const express = require("express");
const cors = require("cors");  

const planetRouter = require("./routes/planets/planets.router");
const launcheRouter = require("./routes/missions/launches.routes");


const app = express();
app.use(express.json());


app.use(cors(
  {
    origin: "http://localhost:3000",
  }
));

app.use("/v1/planets", planetRouter);
app.use("/v1/launches", launcheRouter);

app.get("/", (req, res) => {
  res.send("NASA Project API is running!");
});

module.exports = app;
