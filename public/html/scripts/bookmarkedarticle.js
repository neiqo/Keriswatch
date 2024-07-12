document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    const userId = document.getElementById('userId').value;
    console.log('User ID entered:', userId);

    // Fetch all bookmarked articles for the user by passing userId as a query parameter
    fetch(`/bookmarks?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
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

        return Promise.all(articlePromises);
    })
    .then(articles => {
        console.log('Articles:', articles);
        displayArticles(articles); // Call the displayArticles function with the fetched articles
    })
    .catch(error => console.error('Error:', error));
});

function displayArticles(articles) {
  const articlesList = document.getElementById('articles-list');
  articlesList.innerHTML = '';

  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.className = "article-container";
    articleElement.style.backgroundImage = `url('../media/images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;

    articleElement.innerHTML = `
      <a href="./article.html?id=${article.articleID}">
        <h3 class="article-title">${article.Title}</h3>
      </a>
      <p class="article-author"><strong>Author:</strong> ${article.Author}</p>
      <p class="article-country"><strong>Country:</strong> ${article.Country}</p>
      <p class="article-publisher"><strong>Publisher:</strong> ${article.Publisher}</p>
      <p class="article-sector"><strong>Sector:</strong> ${article.Sector}</p>
      <p class="article-tags"><strong>Tags:</strong> ${article.Tags}</p>
    `;
    articlesList.appendChild(articleElement);
  });
}

