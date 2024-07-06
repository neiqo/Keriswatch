let combinedChart;

document.getElementById('countryForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const country = document.getElementById('country').value;

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

        updateCombinedChart('combinedChart', {
            agriculture: agricultureData[0], 
            services: servicesData[0], 
            manufacture: manufactureData[0]
        });
    })
    .catch(error => console.error('Error:', error));
});

function updateCombinedChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Destroy existing chart if it exists
    if (combinedChart) {
        combinedChart.destroy();
    }

    // Create new chart
    combinedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2022'],
            datasets: [
                {
                    label: 'Agriculture',
                    data: [data.agriculture],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    barThickness: 30
                },
                {
                    label: 'Services',
                    data: [data.services],
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                    barThickness: 30
                },
                {
                    label: 'Manufacture',
                    data: [data.manufacture],
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    barThickness: 30
                }
            ]
        },
        options: {
            indexAxis: 'y', // This makes the chart horizontal
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100 // This sets the max value to 100, making it look like a progress bar
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}



