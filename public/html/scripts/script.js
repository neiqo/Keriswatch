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
                    articleDiv.innerHTML = `
                        <img src="../media/images/articles/article-${article.articleID}/${article.imageFileNames[0]}">
                        <h3>${article.Title}</h3>
                        <p><strong>Author:</strong> ${article.Author}</p>
                        <p><strong>Country:</strong> ${article.Country}</p>
                        <p><strong>Publisher:</strong> ${article.Publisher}</p>
                        <p><strong>Sector:</strong> ${article.Sector}</p>
                        <p><strong>Tags:</strong> ${article.Tags}</p>
                        <hr>
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
