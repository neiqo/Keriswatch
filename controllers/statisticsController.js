const Statistics = require("../models/statistics");

const getStatisticsByCountryAndYear = async (req, res) => {
    const { country, year } = req.params;
    try {
        const data = await Statistics.getStatisticsByCountryAndYear(country, year);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getStatisticsByCountryAndYear
};