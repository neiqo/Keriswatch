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

      articleDiv.innerHTML = `
        <a href="./article.html?id=${article.articleID}" class="article-link">
          <div class="article-content">
            <button class="bookmark-button" data-article-id="${article.articleID}">
              ${isBookmarked ? 'Unbookmark' : 'Bookmark'}
            </button>
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

    // Add event listeners for bookmark buttons
    document.querySelectorAll('.bookmark-button').forEach(button => {
      button.addEventListener('click', function() {
        const articleId = this.getAttribute('data-article-id');
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
            this.textContent = action === 'add' ? 'Unbookmark' : 'Bookmark';
          } else {
            console.error('Error:', response.statusText);
          }
        })
        .catch(error => console.error('Error:', error));
      });
    });
  }
}



/*function displayArticles(articles, bookmarkedArticles, userId) {
    const articlesList = document.getElementById('articles-list');
    articlesList.innerHTML = '';
  
    articles.forEach(article => {
        const isBookmarked = bookmarkedArticles.some(b => b.articleId === article.articleID);
      
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
        <button class="bookmark-button" data-article-id="${article.articleID}"> <!--for bookmarking articles-->
          ${isBookmarked ? 'Unbookmark' : 'Bookmark'}
        </button>
        `;
  
        articlesList.appendChild(articleElement);
    });
  
    document.querySelectorAll('.bookmark-button').forEach(button => {
      button.addEventListener('click', function() {
        const articleId = this.getAttribute('data-article-id');
        const action = this.textContent === 'Bookmark' ? 'add' : 'delete';
  
        fetch(`/bookmarks/${articleId}`, {
          method: action === 'add' ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: userId }) // Send userId in the request body
        })
        .then(response => {
          if (response.ok) {
            this.textContent = action === 'add' ? 'Unbookmark' : 'Bookmark';
          } else {
            console.error('Error:', response.statusText);
          }
        })
        .catch(error => console.error('Error:', error));
      });
    });
}
  
  document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    const userId = document.getElementById('userId').value;
    console.log('User ID entered:', userId);
  
    const url = `/bookmarks?userId=${userId}`;
    console.log('Fetching from URL:', url);
  
    // Fetch all bookmarked articles for the user by passing userId as a query parameter
    fetch(url, {
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
  
        return Promise.all(articlePromises)
        .then(articles => {
          displayArticles(articles, bookmarkedArticles, userId); // Pass userId to displayArticles
        });
    })
    .catch(error => console.error('Error:', error));
}); */