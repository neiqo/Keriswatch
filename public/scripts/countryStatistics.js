document.getElementById('countryForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const country = document.getElementById('country').value;

    // Fetching through the route
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

        updateCombinedChart('statisticsContainer', {
            agriculture: agricultureData[0], 
            services: servicesData[0], 
            manufacture: manufactureData[0]
        });
    })
    .catch(error => console.error('Error:', error));
});

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
