const axios = require('axios');

// Country code for the api
const southeastAsianCountries = ['BRN', 'KHM', 'IDN', 'LAO', 'MYS', 'MMR', 'PHL', 'SGP', 'THA', 'VNM'];

exports.getStatisticsByCountry = async (req, res) => {
    const { country } = req.params;
    if (!southeastAsianCountries.includes(country.toUpperCase())) {
        return res.status(400).send('Invalid country code');
    }

    try {
        // Getting information from the api
        const agricultureResponse = await axios.get(`https://api.worldbank.org/v2/countries/${country}/indicators/NV.AGR.TOTL.ZS?format=json`);
        const industryResponse = await axios.get(`https://api.worldbank.org/v2/countries/${country}/indicators/NV.IND.TOTL.ZS?format=json`);
        const servicesResponse = await axios.get(`https://api.worldbank.org/v2/countries/${country}/indicators/NV.SRV.TOTL.ZS?format=json`);

        const agricultureData = agricultureResponse.data;
        const industryData = industryResponse.data;
        const servicesData = servicesResponse.data;

        // Filtering for latest data, year 2023
        const find2023Data = (data) => {
            return data[1].find(item => item.date === '2023');
        };

        // Finding the 2023 data
        const agriculture2023 = find2023Data(agricultureData);
        const industry2023 = find2023Data(industryData);
        const services2023 = find2023Data(servicesData);

        // Create an array of objects representing the data for each category
        const data = [
            { category: 'Agriculture', percentage: agriculture2023 ? agriculture2023.value : 0 },
            { category: 'Manufacture', percentage: industry2023 ? industry2023.value : 0 },
            { category: 'Services', percentage: services2023 ? services2023.value : 0 }
        ];

        res.json(data);
    } catch (error) {
        console.error('Error fetching data from World Bank API:', error);
        res.status(500).send('Internal Server Error');
    }
};