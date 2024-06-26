document.getElementById('statistics-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const country = document.getElementById('country').value;
    
    const response = await fetch(`/statistics/${country}`);
    const data = await response.json();
    
    const categories = {
        'Agriculture': [],
        'Services': [],
        'Industry': []
    };
    
    data.forEach(stat => {
        categories[stat.Category].push(stat.Percentage);
    });
    
    createChart('agricultureChart', 'Agriculture', categories['Agriculture']);
    createChart('servicesChart', 'Services', categories['Services']);
    createChart('industryChart', 'Industry', categories['Industry']);
});

document.getElementById('statistics-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const country = document.getElementById('country').value;
    
    try {
        const response = await fetch(`/keriswatch/${country}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Display or process the data accordingly
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});


function createChart(canvasId, label, data) {
    new Chart(document.getElementById(canvasId), {
        type: 'bar',
        data: {
            labels: [label],
            datasets: [{
                label: `${label} Statistics`,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
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