const express = require("express");
const router = express.Router();

// Example GET launches
router.get("/", (req, res) => {
  const launches = [
    { flightNumber: 1, mission: "Falcon 1" },
    { flightNumber: 2, mission: "Falcon 9" },
  ];
  res.status(200).json(launches);
});

module.exports = router;
