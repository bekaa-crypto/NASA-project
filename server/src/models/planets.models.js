const fs = require("fs"); // Node.js file system module to read files
const path = require("path"); // Node.js path module to handle file paths
const { parse } = require("csv-parse"); // CSV parser to convert CSV rows to JS objects

const planets = require("./planets.mongo"); // Mongoose model for planets collection

// ✅ Function to check if a planet is habitable
// Criteria:
// 1. Confirmed disposition
// 2. Insolation (koi_insol) between 0.36 and 1.11
// 3. Radius (koi_prad) smaller than 1.6 Earth radii
function isHabitablePlanet(planet) {
  return (
    planet.koi_disposition === "CONFIRMED" &&
    Number(planet.koi_insol) > 0.36 &&
    Number(planet.koi_insol) < 1.11 &&
    Number(planet.koi_prad) < 1.6
  );
}

// ✅ Load planet data from CSV into MongoDB
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    // Path to CSV file
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "kepler_data.csv"
    );

    const updatePromises = []; // Collect all database operations

    // Read CSV file as a stream and parse it
    fs.createReadStream(filePath)
      .pipe(parse({ comment: "#", columns: true })) // Skip comments, use column headers
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          // Save habitable planets to MongoDB (asynchronous)
          updatePromises.push(savePlanet(data));
        }
      })
      .on("error", (err) => reject(err)) // Handle CSV read errors
      .on("end", async () => {
        try {
          await Promise.all(updatePromises); // Wait for all planets to save
          console.log(`${updatePromises.length} habitable planets found!`);
          // Also log the total number of planets actually stored in DB so it's
          // easy to verify whether CSV loading succeeded and how many entries
          // exist after upserts.
          try {
            const total = await planets.countDocuments();
            console.log(`📦 Total planets in DB after load: ${total}`);
          } catch (countErr) {
            console.warn(
              "Could not count planets in DB:",
              countErr.message || countErr
            );
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

// ✅ Get all planets from MongoDB
// .lean() returns plain JS objects instead of full Mongoose documents
async function getAllPlanets() {
  return await planets.find({}, { _id: 0, __v: 0 }).lean();
}

// ✅ Save or update a planet in MongoDB
async function savePlanet(planet) {
  try {
    await planets.updateOne(
      { keplerName: planet.kepler_name }, // Find by kepler_name
      { keplerName: planet.kepler_name }, // Insert/update keplerName field
      { upsert: true } // Create if not exists
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
  savePlanet,
};
