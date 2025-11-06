const express = require("express");
const cors = require("cors");  

const planetRouter = require("./routes/planets/planets.router");
const missionRouter = require("./routes/missions/mission.router");

const app = express();
app.use(express.json());


app.use(cors());

app.use("/v1/planets", planetRouter);
app.use("/v1/missions", missionRouter);

app.get("/", (req, res) => {
  res.send("NASA Project API is running!");
});

module.exports = app;
