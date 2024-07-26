document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleID = urlParams.get('id');

    if (!articleID) {
        alert('No article ID provided.');
        return;
    }

    try {
        const response = await fetch(`/articles/${articleID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const article = await response.json();
        displayArticle(article);
        fetchAllArticlesAndFilter(article.Sector, articleID);  // Pass articleID here
    } catch (error) {
        console.error('Error fetching article:', error);
        alert('Error fetching article. Please try again later.');
    }
});

function displayArticle(article) {
    const articleContainer = document.getElementById('article-container');

    // Format the publishDateTime
    const publishDate = new Date(article.publishDateTime);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = publishDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Create tags HTML
    const tags = article.Tags.split(',').map(tag => `<span class="tag-pill">${tag.trim()}</span>`).join(' ');

    articleContainer.innerHTML = `
        <p class="article-country"><strong></strong> ${article.Country}</p>
        <p class="article-sector"><strong></strong> ${article.Sector}</p>
        <h1 class="article-title">${article.Title}</h1>
        <div id="article-content">
            <div id="left-column">
                <img class="article-img-cover" src='../images/articles/article-${article.articleID}/${article.imageFileNames[0]}'></img>
                <div class="article-body">${article.Body}</div>
                <img class="article-img-body" src='../images/articles/article-${article.articleID}/${article.imageFileNames[1]}'></img>
                <img class="article-img-body" src='../images/articles/article-${article.articleID}/${article.imageFileNames[2]}'></img>    
            </div>
            <div id="right-column">
                <p class="article-author"><strong>Author:</strong> ${article.Author}</p>
                <p class="article-publisher"><strong>Published by:</strong> ${article.Publisher}</p>
                <p class="article-publishDate"><strong>Published on </strong> ${formattedDate} at ${formattedTime}</p>
                <button class="edit-tags-btn" data-article-id="${article.articleID}">Edit Tags</button>
                <div id="edit-tags-container"></div> <!-- Container for the input field -->
                <button class="delete-article-btn" data-article-id="${article.articleID}">Delete news article</button>
                <p class="article-tags-title">Related Topics</p>
                <hr class="tags-line">
                <div class="article-tags">${tags}</div>
            </div>
        </div>
    `;

    setupArticleInteractions(article);
}

function setupArticleInteractions(article) {
    const deleteButton = document.querySelector('.delete-article-btn');
    deleteButton.addEventListener('click', async (event) => {
        const articleID = event.target.getAttribute('data-article-id');
        try {
            const response = await fetch(`/articles/${articleID}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            alert('Article deleted successfully');
            window.location.href = 'displayallarticles.html';
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Error deleting article. Please try again later.');
        }
    });

    const editTagsButton = document.querySelector('.edit-tags-btn');
    editTagsButton.addEventListener('click', () => {
        const editTagsContainer = document.getElementById('edit-tags-container');
        if (editTagsContainer) {
            editTagsContainer.innerHTML = `
                <input type="text" id="new-tags-input" value="${article.Tags}" placeholder="Enter new tags">
                <button id="save-tags-btn">Save Tags</button>
            `;

            const saveTagsButton = document.getElementById('save-tags-btn');
            saveTagsButton.addEventListener('click', async () => {
                const newTagsInput = document.getElementById('new-tags-input');
                const newTags = newTagsInput.value.trim();

                if (newTags !== "") {
                    const articleID = editTagsButton.getAttribute('data-article-id');
                    try {
                        const response = await fetch(`/articles/${articleID}/editTags`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ newTags: newTags })
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        const updatedArticle = await response.json();
                        console.log('Updated article:', updatedArticle);
                        alert('Tags updated successfully');
                        article.Tags = updatedArticle.Tags; // Update local article object
                        location.reload();
                    } catch (error) {
                        console.error('Error updating tags:', error);
                        alert('Error updating tags. Please try again later.');
                    }
                } else {
                    alert('Please enter valid tags.');
                }
            });
        } else {
            console.error('Error: edit-tags-container not found.');
        }
    });
}

async function fetchAllArticlesAndFilter(sector, currentArticleID) {
    try {
        const response = await fetch('/articles'); // Fetch all articles
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const allArticles = await response.json();

        // Ensure currentArticleID is a string for comparison
        const currentArticleIDStr = String(currentArticleID);

        // Filter articles by sector and exclude the current article
        const relatedArticles = allArticles
            .filter(article => article.Sector === sector && String(article.articleID) !== currentArticleIDStr)
            .slice(0, 4); // Limit to 4 articles

        displayRelatedNews(relatedArticles);
    } catch (error) {
        console.error('Error fetching all articles:', error);
        alert('Error fetching related news. Please try again later.');
    }
}

function displayRelatedNews(articles) {
    const relatedNewsContainer = document.getElementById('related-news');


    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'related-article-container';
        articleElement.style.backgroundImage = `url('../images/articles/article-${article.articleID}/${article.imageFileNames[0]}')`;

        // Format the publishDateTime
        const publishDate = new Date(article.publishDateTime);
        const formattedDate = publishDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        articleElement.innerHTML = `
            <a href="article.html?id=${article.articleID}" class="related-article-link">
                <div class="related-article-content">
                    <p class="related-article-sector">${article.Sector}</p>
                    <h2 class="related-article-title">${article.Title}</h2>
                    <p class="related-article-publisher">${article.Publisher}</p>
                    <p class="related-article-date">${formattedDate}</p>
                </div>
            </a>
        `;

        relatedNewsContainer.appendChild(articleElement);
    });
}
