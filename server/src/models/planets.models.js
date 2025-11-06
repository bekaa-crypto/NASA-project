// Import the 'parse' function from the 'csv-parse' library
// It helps read and convert CSV files into JavaScript objects
const { parse } = require('csv-parse');

// Import the built-in 'fs' module to handle file operations
const fs = require('fs');

// Create an array to store planets that meet the "habitable" criteria
const habitablePlanets = [];

// Function to check if a planet is potentially habitable
function isHabitablePlanet(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&   // Planet must be confirmed
    planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && // Receives similar sunlight to Earth
    planet['koi_prad'] < 1.6                        // Radius smaller than 1.6 Earth radii
  );
}

// Create a readable stream to open and read the 'kepler_data.csv' file
fs.createReadStream('kepler_data.csv')
  // Pipe the file data into the CSV parser
  .pipe(parse({
    comment: '#',   // Ignore lines that start with '#'
    columns: true,  // Convert each row into an object using column headers as keys
  }))
  // 'data' event fires for each row read from the CSV
  .on('data', (data) => {
    // Check if the planet is habitable and store it if yes
    if (isHabitablePlanet(data)) {
      habitablePlanets.push(data);
    }
  })
  // 'error' event handles any issues during file reading or parsing
  .on('error', (err) => {
    console.log(err);
  })
  // 'end' event triggers once the file has been fully read
  .on('end', () => {
    // Print the names of all habitable planets
    console.log(
      habitablePlanets.map((planet) => planet['kepler_name'])
    );
    // Print how many habitable planets were found
    console.log(`${habitablePlanets.length} habitable planets found!`);
  });

// Export the array of habitable planets
module.exports = {
  planets:habitablePlanets,
}; 