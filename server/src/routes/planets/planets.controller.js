function getAllPlanets(req, res) {
  const planets = [
    { name: "Mercury" },
    { name: "Venus" },
    { name: "Earth" },
    { name: "Mars" },
  ];
  res.status(200).json(planets);
}

module.exports = { 
  getAllPlanets 
};
