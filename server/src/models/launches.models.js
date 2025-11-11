const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

let latestFlightNumber = 100;

// Default launch
const defaultLaunch = {
  flightNumber: latestFlightNumber,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["Eyoab", "NASA"],
  upcoming: true,
  success: true,
};

// Save the default launch
(async () => {
  await saveLaunch(defaultLaunch);
})();

// ✅ Check if launch exists
async function existsLaunchWithId(launchId) {
  return await launchesDatabase.findOne({ flightNumber: launchId });
}

// ✅ Get latest flight number
async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) return latestFlightNumber;
  return latestLaunch.flightNumber;
}

// ✅ Get all launches
async function getAllLaunches() {
  return await launchesDatabase.find({}, { _id: 0, __v: 0 });
}

// ✅ Save launch (FIXED: allows all Mongo planets)
async function saveLaunch(launch) {
  // Use case-insensitive + flexible space matching
  const planet = await planets.findOne({
    keplerName: { $regex: new RegExp(`^${launch.target.trim()}$`, "i") },
  });

  if (!planet) {
    console.warn(`❌ No matching planet found for target: ${launch.target}`);
    return;
  }

  await launchesDatabase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    { $set: launch },
    { upsert: true }
  );
}

// ✅ Add new launch
async function addNewLaunch(launch) {
  latestFlightNumber = await getLatestFlightNumber() + 1;

  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber,
    upcoming: true,
    success: true,
    customers: ["Eyoab", "NASA"],
  });

  await saveLaunch(newLaunch);
}

// ✅ Abort launch
async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    { $set: { upcoming: false, success: false } }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
