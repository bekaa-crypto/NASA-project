// ===============================
// 🚀 launches.model.js
// ===============================

// Import axios for SpaceX API requests
const axios = require("axios");

// Import MongoDB collections
const launchesDatabase = require("./launches.mongo"); // Launches collection
const planets = require("./planets.mongo"); // Planets collection

// Default flight number (used for initial launches)
let latestFlightNumber = 100;

// ✅ Default launch object
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

// Save the default launch on startup (after planet check)
(async () => {
  await saveLaunch(defaultLaunch);
})();

// SpaceX API endpoint
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

// ===============================================
// ✅ Load launch data from SpaceX API
// ===============================================
async function loadLaunchData() {
  console.log("🛰️ Loading launch data from SpaceX API...");

  // Check if SpaceX data already exists (prevent duplicates)
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("✅ Launch data already loaded!");
    return;
  }

  try {
    // Send POST request to SpaceX API
    const response = await axios.post(SPACEX_API_URL, {
      query: {}, // Empty query = all launches
      options: {
        pagination: false, // Get all launches at once
        populate: [
          {
            path: "rocket",
            select: { name: 1 },
          },
          {
            path: "payloads",
            select: { customers: 1 },
          },
        ],
      },
    });

    // Check if API request succeeded
    if (response.status !== 200) {
      console.log("❌ Problem downloading SpaceX launch data");
      throw new Error("Launch data download failed");
    }

    const launchDocs = response.data.docs;

    // Loop through launches and save them
    for (const launchDoc of launchDocs) {
      const payloads = launchDoc["payloads"];
      const customers = payloads.flatMap((payload) => payload["customers"]);

      const launch = {
        flightNumber: launchDoc["flight_number"],
        mission: launchDoc["name"],
        rocket: launchDoc["rocket"]["name"],
        launchDate: launchDoc["date_local"],
        upcoming: launchDoc["upcoming"],
        success: launchDoc["success"],
        customers,
      };

      //  store SpaceX launches in DB
      await saveLaunch(launch);
    }

    console.log(
      `✅ Launch data loading complete! Total launches: ${launchDocs.length}`
    );
  } catch (err) {
    console.error(`❌ SpaceX API load failed: ${err.message}`);
  }
}

// ===============================================
// 🔍 Find a single launch
// ===============================================
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

// ===============================================
// 🔍 Check if launch exists by flight number
// ===============================================
async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

// ===============================================
// 🧭 Get latest flight number
// ===============================================
async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) return latestFlightNumber;
  return latestLaunch.flightNumber;
}

// ===============================================
// 📋 Get all launches (for frontend/API)
// ===============================================
async function getAllLaunches(skip, limit) {
  // Exclude internal MongoDB fields (_id, __v)
  return await launchesDatabase
  .find({}, { _id: 0, __v: 0 })
  .sort({ flightNumber: 1 })
  .skip(skip)
  .limit(limit  );
}

// ===============================================
// 💾 Save or update a launch (Upsert)
// ===============================================
async function saveLaunch(launch) {
  // Ensure target planet exists (case-insensitive check)
  const targetName = launch.target ? launch.target.trim() : null;

  if (targetName) {
    const planet = await planets.findOne({
      keplerName: { $regex: new RegExp(`^${targetName}$`, "i") },
    });

    if (!planet) {
      console.warn(`⚠️ No matching planet found for target: ${targetName}`);
      return; // Skip saving if planet not found
    }
  }

  // Insert or update launch
  await launchesDatabase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    { $set: launch },
    { upsert: true }
  );
}

// ===============================================
// 🆕 Add a new launch (from frontend/API)
// ===============================================
async function addNewLaunch(launch) {
  latestFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber,
    upcoming: true,
    success: true,
    customers: ["Eyoab", "NASA"],
  });

  await saveLaunch(newLaunch);
}

// ===============================================
// ❌ Abort a launch by ID
// ===============================================
async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    { $set: { upcoming: false, success: false } }
  );

  return aborted.modifiedCount === 1;
}

// ===============================================
// 📦 Export functions
// ===============================================
module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
