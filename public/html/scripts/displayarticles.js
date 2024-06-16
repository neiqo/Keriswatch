document.addEventListener("DOMContentLoaded", async function() {
  try {
    const response = await fetch('/articles');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const articles = await response.json();
    displayArticles(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    alert('Error fetching articles. Please try again later.');
  }
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
      <h3 class="article-title">${article.Title}</h3>
      <p class="article-author"><strong>Author:</strong> ${article.Author}</p>
      <p class="article-country"><strong>Country:</strong> ${article.Country}</p>
      <p class="article-publisher"><strong>Publisher:</strong> ${article.Publisher}</p>
      <p class="article-sector"><strong>Sector:</strong> ${article.Sector}</p>
      <p class="article-tags"><strong>Tags:</strong> ${article.Tags}</p>
      <p class="article-body">${article.Body}</p>
      <button class="delete-article-btn" data-article-id="${article.articleID}">Delete</button>
    `;

    articlesList.appendChild(articleElement);
  });

  const deleteButtons = document.querySelectorAll('.delete-article-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const articleID = event.target.getAttribute('data-article-id');
      try {
        const response = await fetch(`/articles/${articleID}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        event.target.closest('.article-container').remove();
        alert('Article deleted successfully');
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article. Please try again later.');
      }
    });
  });
}
