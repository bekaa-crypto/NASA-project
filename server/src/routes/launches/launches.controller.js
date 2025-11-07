const { getAllLaunches } = require("../../models/launches.models");

function httpgetAllLaunches(req, res) {
    return res.status(200).json(getAllLaunches);
}   

module.exports = {
    httpgetAllLaunches
} ;