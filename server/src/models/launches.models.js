const launches = new Map();
let latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030").toISOString(),
  target: "Kepler-442b",
  customers: ["ZTM", "NASA"],
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
    latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      upcoming: true,
      success: true,
      customers: ["zero to mastery", "NASA"],
    })
  );
}

function abortLaunch(flightNumber) {
  const launch = launches.get(flightNumber);
  if (launch) {
    launch.upcoming = false;
    launch.success = false;
    return true;
  }
  return false;
}

module.exports = { getAllLaunches, addNewLaunch, abortLaunch };
