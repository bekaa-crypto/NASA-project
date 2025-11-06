const express = require("express");
const router = express.Router();

// In-memory launches store (for demo / development)
const launches = new Map();
let latestFlightNumber = 100;

function existsLaunchWithId(id) {
  return launches.has(Number(id));
}

// Get all launches
router.get("/", (req, res) => {
  return res.status(200).json(Array.from(launches.values()));
});

// Add a new launch
router.post("/", (req, res) => {
  const launch = req.body;

  if (
    !launch ||
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({ error: "Missing required launch property" });
  }

  const date = new Date(launch.launchDate);
  if (isNaN(date)) {
    return res.status(400).json({ error: "Invalid launch date" });
  }

  latestFlightNumber += 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber,
    launchDate: date.toISOString(),
    upcoming: true,
    success: true,
  });

  launches.set(newLaunch.flightNumber, newLaunch);

  return res.status(201).json(newLaunch);
});

// Delete (abort) a launch by id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!existsLaunchWithId(id)) {
    return res.status(404).json({ error: "Launch not found" });
  }

  const aborted = launches.get(id);
  aborted.upcoming = false;
  aborted.success = false;
  launches.set(id, aborted);

  return res.status(200).json(aborted);
});

module.exports = router;
