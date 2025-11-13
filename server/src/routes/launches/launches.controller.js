const {
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require("../../models/launches.models");

const { getPagination } = require("../../services/quary");
async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit); // ✅ Use await here
  try {
    const total = launches.length;
    const upcomingCount = launches.filter((l) => l.upcoming).length;
    const historyCount = total - upcomingCount;
    console.log(
      `📤 GET /launches -> total=${total}, upcoming=${upcomingCount}, history=${historyCount}`
    );
  } catch (err) {
    // ignore logging errors
  }
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
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

  try {
    const savedLaunch = await addNewLaunch(launch); // returns saved document
    return res.status(201).json(savedLaunch);
  } catch (err) {
    console.error("Error adding launch:", err.message || err);
    // If the error came from missing planet validation, return 400
    if (err.message && err.message.startsWith("No matching planet found")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Could not schedule launch" });
  }
}

async function httpAbortLaunch(req, res) {
  const flightNumber = Number(req.params.id);

  if (isNaN(flightNumber)) {
    return res.status(400).json({
      error: "Invalid flight number",
    });
  }

  const existsLaunch = await existsLaunchWithId(flightNumber); // ✅ Await
  if (!existsLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = await abortLaunchById(flightNumber); // ✅ Await
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }

  // Return the updated launch document so the client can update UI
  return res.status(200).json(aborted);
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
