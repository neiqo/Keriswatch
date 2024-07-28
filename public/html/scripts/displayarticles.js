document.addEventListener("DOMContentLoaded", async function() {
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

  try {
      const response = await fetch('/articles');
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const articles = await response.json();

      // Initialize the dropdown and attach event listener
      const countrySelector = document.getElementById('country-selector');
      countrySelector.addEventListener('change', (event) => {
          const selectedCountry = event.target.value;
          filterAndDisplayArticles(selectedCountry, articles, bookmarkedArticleIds, token, userId, userRole);
      });

      // Initial load
      const defaultCountry = countrySelector.value;
      filterAndDisplayArticles(defaultCountry, articles, bookmarkedArticleIds, token, userId, userRole);

      // Display the most recent articles
      displayRecentArticles(articles, 'latest-news', 4, bookmarkedArticleIds, token, userId, userRole);

  } catch (error) {
      console.error('Error fetching articles:', error);
      alert('Error fetching articles. Please try again later.');
  }
});

function filterAndDisplayArticles(country, articles, bookmarkedArticleIds, token, userId, userRole) {
  // Filter articles based on the selected country
  const agricultureArticles = articles.filter(article => article.Country === country && article.Sector === 'Agriculture');
  const servicesArticles = articles.filter(article => article.Country === country && article.Sector === 'Services');
  const manufactureArticles = articles.filter(article => article.Country === country && article.Sector === 'Manufacture');

  // Update the title and display articles for each sector
  updateTitle(country);
  displayArticles(agricultureArticles, 'agriculture-news', bookmarkedArticleIds, token, userId, userRole);
  displayArticles(servicesArticles, 'services-news', bookmarkedArticleIds, token, userId, userRole);
  displayArticles(manufactureArticles, 'manufacture-news', bookmarkedArticleIds, token, userId, userRole);
}

function updateTitle(country) {
  const titleElement = document.getElementById('sector-country-news-title');
  titleElement.textContent = `Sector News in ${country}`;
}

function displayArticles(articles, elementId, bookmarkedArticleIds, token, userId, userRole) {
  const articlesList = document.getElementById(elementId);
  articlesList.innerHTML = '';

  articles.forEach(article => {
      const articleElement = document.createElement('div');
      articleElement.classList.add('article-container');
      articleElement.style.backgroundImage = `url('./images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;

      // Format the publishDateTime
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

      articleElement.innerHTML = `
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

          articleElement.appendChild(bookmarkButton);
      }

      articlesList.appendChild(articleElement);
  });
}

function displayRecentArticles(articles, elementId, numArticles, bookmarkedArticleIds, token, userId, userRole) {
  // Sort articles by date in descending order
  const sortedArticles = articles.sort((a, b) => new Date(b.PublishedDate) - new Date(a.PublishedDate));

  // Select the top 'numArticles' recent articles
  const recentArticles = sortedArticles.slice(0, numArticles);

  // Display the recent articles
  displayArticles(recentArticles, elementId, bookmarkedArticleIds, token, userId, userRole);
}
