document.addEventListener("DOMContentLoaded", function() {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('query'); // Get the search query parameter

    if (query) {
        fetch(`/search?${searchParams.toString()}`)
            .then(response => response.json())
            .then(data => {
                const resultsDiv = document.getElementById('searchResults');
                resultsDiv.innerHTML = ''; // Clear previous results

                if (!data || data.length === 0) {
                    resultsDiv.innerHTML = '<p>No articles found.</p>';
                } else {
                    data.forEach(article => {
                        const articleDiv = document.createElement('div');
                        articleDiv.className = "article-container";
                        articleDiv.style.backgroundImage = `url('../images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;
                        articleDiv.innerHTML = `
                            <a href="./article.html?id=${article.articleID}" class="article-link">
                                <div class="article-content">
                                    <p class="article-sector"><strong></strong> ${article.Sector}</p>
                                    <h3 class="article-title">${article.Title}</h3>
                                    <p class="article-publisher"><strong></strong> ${article.Publisher}</p>
                                </div>
                            </a>
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
    }
});
