document.addEventListener("DOMContentLoaded", async function() {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('query') || ''; // Get the search query parameter or default to an empty string
    const sectorFilter = searchParams.get('sector') || 'all'; // Get the sector filter parameter or default to 'all'
    const countryFilter = searchParams.get('country') || 'all'; // Get the country filter parameter or default to 'all'

    let fetchUrl = '/search';
    const urlParams = [];

    if (query) {
        urlParams.push(`query=${encodeURIComponent(query)}`);
    }
    if (sectorFilter !== 'all') {
        urlParams.push(`sector=${encodeURIComponent(sectorFilter)}`);
    }
    if (countryFilter !== 'all') {
        urlParams.push(`country=${encodeURIComponent(countryFilter)}`);
    }
    if (urlParams.length > 0) {
        fetchUrl += `?${urlParams.join('&')}`;
    }

    // Debugging: Check constructed URL
    console.log('Fetch URL:', fetchUrl);

    let token = localStorage.getItem('token') || null;
    let userId;
    let userRole;
    let bookmarkedArticleIds = [];

    if (token) {
        const decodedToken = jwt_decode(token);
        userId = decodedToken.userId;
        userRole = decodedToken.role; // Assuming the role is stored in the token

        try {
            // Fetch bookmarked articles for the user
            const bookmarkedResponse = await fetch(`/bookmarks?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!bookmarkedResponse.ok) {
                throw new Error(`HTTP error! Status: ${bookmarkedResponse.status}`);
            }
            const bookmarkedArticles = await bookmarkedResponse.json();
            bookmarkedArticleIds = bookmarkedArticles.map(bookmark => bookmark.articleId);
        } catch (error) {
            console.error('Error fetching bookmarked articles:', error);
            alert('Error fetching bookmarked articles. Please try again later.');
        }
    }

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
                        filterAndDisplayResults(allArticles, sectorFilter, countryFilter, bookmarkedArticleIds, token, userId, userRole);
                    })
                    .catch(error => {
                        console.error('Error fetching all articles:', error);
                        const resultsDiv = document.getElementById('searchResults');
                        resultsDiv.innerHTML = '<p>Error fetching articles. Please try again later.</p>';
                    });
            } else {
                // Filter and display articles based on query, sectorFilter, and countryFilter
                filterAndDisplayResults(data, sectorFilter, countryFilter, bookmarkedArticleIds, token, userId, userRole);
            }
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = '<p>Error fetching articles. Please try again later.</p>';
        });
});

function filterAndDisplayResults(articles, sectorFilter, countryFilter, bookmarkedArticleIds, token, userId, userRole) {
    let filteredData = articles;

    if (sectorFilter !== 'all') {
        filteredData = filteredData.filter(article => article.Sector === sectorFilter);
    }
    if (countryFilter !== 'all') {
        filteredData = filteredData.filter(article => article.Country === countryFilter);
    }

    displayResults(filteredData, bookmarkedArticleIds, token, userId, userRole);
}

function displayResults(articles, bookmarkedArticleIds, token, userId, userRole) {
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

            if (token && userRole !== 'Organisation') {
                // Create bookmark button with event listener if user is logged in and not an Organisation
                const bookmarkButton = document.createElement('button');
                bookmarkButton.className = 'bookmark-button';
                bookmarkButton.dataset.articleId = article.articleID;
                bookmarkButton.textContent = bookmarkedArticleIds.includes(article.articleID) ? 'Unbookmark' : 'Bookmark';

                bookmarkButton.addEventListener('click', function() {
                    const articleId = this.dataset.articleId;
                    const action = this.textContent === 'Bookmark' ? 'add' : 'delete';

                    fetch(`/bookmarks/${articleId}`, {
                        method: action === 'add' ? 'POST' : 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ userId: userId }) // Send userId in the request body
                    })
                    .then(response => {
                        if (response.ok) {
                            this.textContent = action === 'add' ? 'Unbookmark' : 'Bookmark';
                            if (action === 'add') {
                                bookmarkedArticleIds.push(articleId);
                            } else {
                                const index = bookmarkedArticleIds.indexOf(articleId);
                                if (index > -1) {
                                    bookmarkedArticleIds.splice(index, 1);
                                }
                            }
                        } else {
                            console.error('Error:', response.statusText);
                        }
                    })
                    .catch(error => console.error('Error:', error));
                });

                articleDiv.appendChild(bookmarkButton);
            }

            resultsDiv.appendChild(articleDiv);
        });
    }
}
