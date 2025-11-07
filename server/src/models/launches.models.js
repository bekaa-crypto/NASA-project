const launches = new Map();

let latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030").toISOString(),
  destination: "Kepler-442 b",
  customer: ["Eyu", "NASA"],
  upcoming: true,
  success: true,
};

launches.set(launch.flightNumber, launch);

function getAllLaunches() {
  return Array.from(launches.values());
}
function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    launch.latestFlightNumber ,
    Object.assign(launch, {
      success: true,
      upcoming: true,
      flightNumber: latestFlightNumber,
      customers: ["Eyoab", "NASA"],
    })
  );
}

module.exports = { 
    getAllLaunches,
    addNewLaunch,
 }; 
