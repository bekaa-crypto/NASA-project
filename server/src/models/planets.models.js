const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");


const habitablePlanets = [];

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
    habitablePlanets.length = 0;
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "kepler_data.csv"
    );

    fs.createReadStream(filePath)
      .pipe(parse({ comment: "#", columns: true }))
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve();
      });
  });
}
function getAllPlanets() {
  return habitablePlanets;
}
module.exports = {
   loadPlanetsData,
   getAllPlanets,
  
};
 