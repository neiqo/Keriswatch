document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    
    const formData = new FormData(this); // Get form data
    const searchParams = new URLSearchParams(formData); // Convert to URL-encoded string
    
    fetch('/search?' + searchParams.toString()) // Send GET request to /search endpoint
        .then(response => response.json()) // Parse JSON response
        .then(data => {
            // Handle response data
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = ''; // Clear previous results
            
            if (!data || data.length === 0) {
                resultsDiv.innerHTML = '<p>No articles found.</p>';
            } else {
                data.forEach(article => {
                    const articleDiv = document.createElement('div');
                    articleDiv.className = "article-container";
                    articleDiv.style.backgroundImage = `url('../media/images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;
                    articleDiv.innerHTML = `
                        <h3 class="article-title">${article.Title}</h3>
                        <p class="article-author"><strong>Author:</strong> ${article.Author}</p>
                        <p class="article-country"><strong>Country:</strong> ${article.Country}</p>
                        <p class="article-publisher"><strong>Publisher:</strong> ${article.Publisher}</p>
                        <p class="article-sector"><strong>Sector:</strong> ${article.Sector}</p>
                        <p class="article-tags"><strong>Tags:</strong> ${article.Tags}</p>
                    `;

                    resultsDiv.appendChild(articleDiv);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = '<p>Error fetching articles. Please try again later.</p>';
        });
});
