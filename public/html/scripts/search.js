document.addEventListener("DOMContentLoaded", function() {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('query') || ''; // Get the search query parameter or default to an empty string
    const sectorFilter = searchParams.get('sector') || 'all'; // Get the sector filter parameter or default to 'all'

    let fetchUrl = '/search';

    if (query && sectorFilter !== 'all') {
        // If both query and sector filter are provided, use them
        fetchUrl += `?query=${encodeURIComponent(query)}&sector=${encodeURIComponent(sectorFilter)}`;
    } else if (query) {
        // If only query is provided, fetch articles matching the query
        fetchUrl += `?query=${encodeURIComponent(query)}`;
    } else if (sectorFilter !== 'all') {
        // If only sector filter is provided, fetch articles matching the sector
        fetchUrl += `?query=${encodeURIComponent(sectorFilter)}`;
    }

    // Debugging: Check constructed URL
    console.log('Fetch URL:', fetchUrl);

    // Fetch articles
    fetch(fetchUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Debugging: Log fetched data
            console.log('Fetched Data:', data);

            if (sectorFilter === 'all' && !query) {
                // Fetch all articles if no query and sectorFilter is 'all'
                fetch('/articles')
                    .then(response => response.json())
                    .then(allArticles => {
                        displayArticles(allArticles);
                    })
                    .catch(error => {
                        console.error('Error fetching all articles:', error);
                        const resultsDiv = document.getElementById('searchResults');
                        resultsDiv.innerHTML = '<p>Error fetching articles. Please try again later.</p>';
                    });
            } else {
                // Filter and display articles based on query or sectorFilter
                const filteredData = sectorFilter !== 'all'
                    ? data.filter(article => article.Sector === sectorFilter)
                    : data;

                displayResults(filteredData);
            }
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = '<p>Error fetching articles. Please try again later.</p>';
        });
});

function displayResults(articles) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (!articles || articles.length === 0) {
        resultsDiv.innerHTML = '<p>No articles found.</p>';
    } else {
        articles.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.className = "article-container";
            articleDiv.style.backgroundImage = `url('../images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;
            
            const publishDate = new Date(article.publishDateTime);
            const formattedDate = publishDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
            const formattedTime = publishDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            articleDiv.innerHTML = `
            <a href="./article.html?id=${article.articleID}" class="article-link">
                <div class="article-content">
                    <p class="article-sector">${article.Sector}</p>
                    <h3 class="article-title">${article.Title}</h3>
                    <div id="row1">
                    <p class="article-publisher">${article.Publisher}</p>
                    <div id="column1">
                        <p class="article-publishDate">${formattedDate}</p>
                        <p class="article-publishTime">${formattedTime}</p>
                    </div>
                    </div>
                </div>
            </a>
            `;
            resultsDiv.appendChild(articleDiv);
        });
    }
}

function displayArticles(articles) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (!articles || articles.length === 0) {
        resultsDiv.innerHTML = '<p>No articles found.</p>';
    } else {
        articles.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.className = "article-container";
            articleDiv.style.backgroundImage = `url('./images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;
            
            const publishDate = new Date(article.publishDateTime);
            const formattedDate = publishDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
            const formattedTime = publishDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            articleDiv.innerHTML = `
            <a href="./article.html?id=${article.articleID}" class="article-link">
                <div class="article-content">
                    <p class="article-sector">${article.Sector}</p>
                    <h3 class="article-title">${article.Title}</h3>
                    <div id="row1">
                    <p class="article-publisher">${article.Publisher}</p>
                    <div id="column1">
                        <p class="article-publishDate">${formattedDate}</p>
                        <p class="article-publishTime">${formattedTime}</p>
                    </div>
                    </div>
                </div>
            </a>
            `;
            resultsDiv.appendChild(articleDiv);
        });
    }
}
