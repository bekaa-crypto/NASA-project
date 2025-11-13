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
    // Return upcoming launches first, then newest by flightNumber. This
    // ensures upcoming missions appear at the top of the list the frontend
    // fetches (the client requests launches without pagination by default).
    .sort({ upcoming: -1, flightNumber: -1 })
    .skip(skip)
    .limit(limit);
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
      // Strict validation: if the client specified a target planet but it's not
      // present in the planets collection, reject the launch request. This
      // prevents scheduling launches to unknown destinations.
      const msg = `No matching planet found for target: ${targetName}`;
      console.warn(`⚠️ ${msg}`);
      throw new Error(msg);
    }
  }

  // Insert or update launch
  const result = await launchesDatabase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    { $set: launch },
    { upsert: true, new: true, runValidators: true }
  );
  // Diagnostic log: show that a launch was saved/updated and its key properties
  try {
    console.log(
      `💾 Launch saved: flightNumber=${result.flightNumber}, mission=${result.mission}, upcoming=${result.upcoming}`
    );
  } catch (err) {
    // ignore logging errors
  }

  return result;
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

  const saved = await saveLaunch(newLaunch);
  if (!saved) {
    throw new Error("Failed to save launch");
  }
  return saved;
}

// ===============================================
// ❌ Abort a launch by ID
// ===============================================
async function abortLaunchById(launchId) {
  const result = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    { $set: { upcoming: false, success: false } }
  );

  // Fetch updated document for diagnostics and return it to the caller.
  const updated = await launchesDatabase.findOne(
    { flightNumber: launchId },
    { _id: 0, __v: 0 }
  );

  try {
    if (updated) {
      console.log(
        `✂️ Launch aborted: flightNumber=${updated.flightNumber}, upcoming=${updated.upcoming}, success=${updated.success}`
      );
    } else {
      console.log(
        `✂️ Launch abort attempted but document not found: flightNumber=${launchId}`
      );
    }
  } catch (err) {
    // ignore logging errors
  }

  return updated;
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
