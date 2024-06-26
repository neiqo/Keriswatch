const Statistic = require("../models/statistic");

const getAllStatistics = async (req, res) => {
  try {
    const statistics = await Statistic.getAllStatistics();
    res.json(statistics);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving statistics");
  }
};

const getStatisticsByCountry = async (req, res) => {
  const country = req.params.country;
  try {
    const statistics = await Statistic.getStatisticsByCountry(country);
    res.json(statistics);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving statistics");
  }
};

module.exports = {
  getAllStatistics,
  getStatisticsByCountry
};