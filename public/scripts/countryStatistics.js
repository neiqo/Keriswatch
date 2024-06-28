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
        const industryData = [];

        data.forEach(item => {
            if (item.category === 'Agriculture') {
                agricultureData.push(item.percentage);
            } else if (item.category === 'Services') {
                servicesData.push(item.percentage);
            } else if (item.category === 'Industry') {
                industryData.push(item.percentage);
            }
        });

        createChart('agricultureChart', 'Agriculture', agricultureData);
        createChart('servicesChart', 'Services', servicesData);
        createChart('industryChart', 'Industry', industryData);
    })
    .catch(error => console.error('Error:', error));
});

function createChart(canvasId, label, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2022'],
            datasets: [{
                label: label,
                data: data,
                backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

