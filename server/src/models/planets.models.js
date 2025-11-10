const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet.koi_disposition === "CONFIRMED" &&
    Number(planet.koi_insol) > 0.36 &&
    Number(planet.koi_insol) < 1.11 &&
    Number(planet.koi_prad) < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "kepler_data.csv"
    );
    const updatePromises = [];

    fs.createReadStream(filePath)
      .pipe(parse({ comment: "#", columns: true }))
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          // collect save promises so we can wait for all DB upserts
          updatePromises.push(savePlanet(data));
        }
      })
      .on("error", (err) => reject(err))
      .on("end", async () => {
        try {
          await Promise.all(updatePromises);
          console.log(`${updatePromises.length} habitable planets found!`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}
async function getAllPlanets() {
  // use .lean() to return plain JS objects (not Mongoose documents)
  return await planets.find({}, { _id: 0, __v: 0 }).lean();
}
async function savePlanet(planet) {
  try {
    await planets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
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
