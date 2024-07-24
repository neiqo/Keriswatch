document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display statistics for Singapore on page load
    fetchStatistics('SGP');

    // Set up event listener for the image map
    /*document.querySelectorAll('area').forEach(area => {
        area.addEventListener('click', function (e) {
            e.preventDefault();
            const country = this.dataset.country;
            fetchStatistics(country);
        });
    });*/

    // Event listener for the country selector dropdown
    const countrySelector = document.getElementById('country-selector');
    countrySelector.addEventListener('change', function () {
        const selectedCountry = countrySelector.value;
        const countryCodes = {
            'Singapore': 'SGP',
            'Malaysia': 'MYS',
            'Brunei': 'BRN',
            'Cambodia': 'KHM',
            'Indonesia': 'IDN',
            'Laos': 'LAO',
            'Myanmar': 'MMR',
            'Philippines': 'PHL',
            'Vietnam': 'VNM',
            'Thailand': 'THA'
        };
        fetchStatistics(countryCodes[selectedCountry]);
    });
});

function fetchStatistics(country) {
    fetch(`/statistics/${country}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const agricultureData = [];
        const servicesData = [];
        const manufactureData = [];
        
        data.forEach(item => {
            if (item.category === 'Agriculture') {
                agricultureData.push(item.percentage);
            } else if (item.category === 'Services') {
                servicesData.push(item.percentage);
            } else if (item.category === 'Manufacture') {
                manufactureData.push(item.percentage);
            }
        });

        // Update the selected country display
        updateSelectedCountry(country);

        // Update the chart with the fetched data
        updateCombinedChart('statisticsContainer', {
            agriculture: agricultureData[0], 
            services: servicesData[0], 
            manufacture: manufactureData[0]
        });
    })
    .catch(error => console.error('Error:', error));
}

function updateSelectedCountry(countryCode) {
    // Dictionary for storing code and countries
    const countryNames = {
        'PHL': 'Philippines',
        'SGP': 'Singapore',
        'KHM': 'Cambodia',
        'BRN': 'Brunei',
        'MMR': 'Myanmar',
        'THA': 'Thailand',
        'MYS': 'Malaysia',
        'VNM': 'Vietnam',
        'IDN': 'Indonesia',
        'LAO': 'Laos'
    };

    // Display the selected country name to the users
    const selectedCountryDiv = document.getElementById('selectedCountry');
    selectedCountryDiv.textContent = `${countryNames[countryCode]} statistics for the year of 2023`;
}

// Used for creating the chart in html
function updateCombinedChart(containerId, data) {
    const container = document.getElementById(containerId);

    // Clear previous content
    container.innerHTML = '';

    // Create skill bars
    createSkillBar(container, 'Agriculture', data.agriculture, 'agriculture');
    createSkillBar(container, 'Services', data.services, 'services');
    createSkillBar(container, 'Manufacture', data.manufacture, 'manufacture');
}

function createSkillBar(container, label, percentage, className) {
    const skillContainer = document.createElement('div');
    skillContainer.className = 'skill-container';

    const skillLabel = document.createElement('div');
    skillLabel.className = 'skill-label';
    skillLabel.textContent = label;

    const skillBarContainer = document.createElement('div');
    skillBarContainer.className = 'skill-bar-container';

    const skillBar = document.createElement('div');
    skillBar.className = `skill-bar ${className}`;
    const roundedPercentage = Math.round(percentage) || 0;
    skillBar.style.width = `${roundedPercentage}%`;
    skillBar.textContent = `${roundedPercentage}%`;

    skillBarContainer.appendChild(skillBar);
    skillContainer.appendChild(skillLabel);
    skillContainer.appendChild(skillBarContainer);
    container.appendChild(skillContainer);
}