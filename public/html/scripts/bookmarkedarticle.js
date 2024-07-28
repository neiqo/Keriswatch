const token = localStorage.getItem('token');
const decodedToken = jwt_decode(token);
const userId = decodedToken.userId;

document.addEventListener('DOMContentLoaded', function () {
  // Fetch and display bookmarked articles for the user
  fetchBookmarkedArticles(userId);
});

function fetchBookmarkedArticles(userId) {
  fetch(`/bookmarks?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Send token if required
    }
  })
  .then(response => response.json())
  .then(bookmarkedArticles => {
    console.log('Bookmarked articles:', bookmarkedArticles);

    // Extract article IDs
    const articleIds = bookmarkedArticles.map(bookmark => bookmark.articleId);
    console.log('Article IDs:', articleIds);

    // Fetch details for each article
    const articlePromises = articleIds.map(articleId => 
      fetch(`/articles/${articleId}`)
        .then(response => response.json())
    );

    return Promise.all(articlePromises)
      .then(articles => {
        displayArticles(articles, bookmarkedArticles); // Call the displayArticles function with the fetched articles
      });
  }) 
  .catch(error => console.error('Error:', error));
}

function displayArticles(articles, bookmarkedArticles) {
  const resultsDiv = document.getElementById('articles-list');
  resultsDiv.innerHTML = ''; // Clear previous results

  if (!articles || articles.length === 0) {
    resultsDiv.innerHTML = '<p>No articles found.</p>';
  } else {
    articles.forEach(article => {
      const isBookmarked = bookmarkedArticles.some(b => b.articleId === article.articleID);
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

      // Create bookmark button with event listener
      const bookmarkButton = document.createElement('button');
      bookmarkButton.className = 'bookmark-button';
      bookmarkButton.dataset.articleId = article.articleID;
      bookmarkButton.textContent = isBookmarked ? 'Unbookmark' : 'Bookmark';

      bookmarkButton.addEventListener('click', function() {
        const articleId = this.dataset.articleId;
        const action = this.textContent === 'Bookmark' ? 'add' : 'delete';

        fetch(`/bookmarks/${articleId}`, {
          method: action === 'add' ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: userId }) // Send userId in the request body
        })
        .then(response => {
          if (response.ok) {
            location.reload(); // Refresh the page after bookmark action
          } else {
            console.error('Error:', response.statusText);
          }
        })
        .catch(error => console.error('Error:', error));
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

      // Append the bookmark button to the article element
      articleDiv.appendChild(bookmarkButton);

      resultsDiv.appendChild(articleDiv);

      // Log to verify bookmark button creation and appending
      console.log(`Bookmark button for article ${article.articleID} created and appended.`);
    });
  }
}
