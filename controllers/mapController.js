const axios = require('axios');

const tomTomApiKey = 'lvAYdlO2zST2ZuBN5f45K8nK11GJvfd2';

exports.getLocationData = async (req, res) => {
    const { postalCode, countryCode } = req.query;

    if (!postalCode || !countryCode) {
        return res.status(400).send('Postal code and country code are required');
    }

    try {
        // First API call to get latitude and longitude from postal code and country code
        const structuredGeocodeResponse = await axios.get('https://api.tomtom.com/search/2/structuredGeocode.json', {
            params: {
                key: tomTomApiKey,
                postalCode: postalCode,
                countryCode: countryCode
            }
        });

        const geocodeData = structuredGeocodeResponse.data;
        if (!geocodeData.results || geocodeData.results.length === 0) {
            return res.status(404).send('Location not found');
        }

        const { lat, lon } = geocodeData.results[0].position;

        // Second API call to get reverse geocode data using the obtained latitude and longitude
        const reverseGeocodeResponse = await axios.get(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json`, {
            params: {
                key: tomTomApiKey
            }
        });

        const reverseGeocodeData = reverseGeocodeResponse.data;
        res.json(reverseGeocodeData);
    } catch (error) {
        console.error('Error fetching data from TomTom API:', error);
        res.status(500).send('Internal Server Error');
    }
};
