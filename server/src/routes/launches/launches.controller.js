const { getAllLaunches, addNewLaunch, abortLaunch } = require("../../models/launches.models");

function httpGetAllLaunches(req, res) {
  return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }
  addNewLaunch(launch);
  return res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
  const flightNumber = Number(req.params.id);
  if (isNaN(flightNumber)) {
    return res.status(400).json({
      error: "Invalid flight number",
    });
  }
  const deleted = abortLaunch(flightNumber);
  if (!deleted) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }
  return res.status(204).json();
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
