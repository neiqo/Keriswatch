document.addEventListener("DOMContentLoaded", async function() {
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
      filterAndDisplayArticles(selectedCountry, articles);
    });

    // Initial load
    const defaultCountry = countrySelector.value;
    filterAndDisplayArticles(defaultCountry, articles);

    // Display the most recent articles
    displayRecentArticles(articles, 'latest-news', 4); // Display top 5 recent articles

  } catch (error) {
    console.error('Error fetching articles:', error);
    alert('Error fetching articles. Please try again later.');
  }
});

function filterAndDisplayArticles(country, articles) {
  // Filter articles based on the selected country
  const agricultureArticles = articles.filter(article => article.Country === country && article.Sector === 'Agriculture');
  const servicesArticles = articles.filter(article => article.Country === country && article.Sector === 'Services');
  const manufactureArticles = articles.filter(article => article.Country === country && article.Sector === 'Manufacture');

  // Update the title and display articles for each sector
  updateTitle(country);
  displayArticles(agricultureArticles, 'agriculture-news');
  displayArticles(servicesArticles, 'services-news');
  displayArticles(manufactureArticles, 'manufacture-news');
}

function updateTitle(country) {
  const titleElement = document.getElementById('sector-country-news-title');
  titleElement.textContent = `Sector News in ${country}`;
}

function displayArticles(articles, elementId) {
  const articlesList = document.getElementById(elementId);
  articlesList.innerHTML = '';

  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article-container');
    articleElement.style.backgroundImage = `url('./images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;

    articleElement.innerHTML = `
      <a href="./article.html?id=${article.articleID}" class="article-link">
        <div class="article-content">
          <p class="article-sector"><strong></strong> ${article.Sector}</p>
          <h3 class="article-title">${article.Title}</h3>
          <p class="article-publisher"><strong></strong> ${article.Publisher}</p>
        </div>
      </a>
    `;

    articlesList.appendChild(articleElement);
  });
}

function displayRecentArticles(articles, elementId, numArticles) {
  // Sort articles by date in descending order
  const sortedArticles = articles.sort((a, b) => new Date(b.PublishedDate) - new Date(a.PublishedDate));

  // Select the top 'numArticles' recent articles
  const recentArticles = sortedArticles.slice(0, numArticles);

  // Display the recent articles
  displayArticles(recentArticles, elementId);
}
