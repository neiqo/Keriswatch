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
    
    articles.forEach(article => {
      const articleElement = document.createElement('div');
      articleElement.classList.add('article');
    
      const imagePath = `../media/images/article-${article.articleID}/`;

      articleElement.innerHTML = `
        <h2>${article.Title}</h2>
        <p><strong>Author:</strong> ${article.Author}</p>
        <p><strong>Publisher:</strong> ${article.Publisher}</p>
        <p><strong>Country:</strong> ${article.Country}</p>
        <p><strong>Sector:</strong> ${article.Sector}</p>
        <p><strong>Published Date:</strong> ${new Date(article.publishDateTime).toLocaleDateString()}</p>
        <p><strong>Tags:</strong> ${article.Tags}</p>
        <p>${article.Body}</p>
      `;
  
      // Append images if available
      if (article.imageFileNames && article.imageFileNames.length > 0) {
        const imagesDiv = document.createElement('div');
        imagesDiv.classList.add('article-images');
        article.imageFileNames.forEach(imageFileName => {
          const img = document.createElement('img');
          img.src = `${imagePath}${imageFileName}`;
          img.alt = 'Article Image';
          imagesDiv.appendChild(img);
        });
        articleElement.appendChild(imagesDiv);
      }
  
      articlesList.appendChild(articleElement);
    });

  }
  