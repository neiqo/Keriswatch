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
    } catch (error) {
        console.error('Error fetching article:', error);
        alert('Error fetching article. Please try again later.');
    }
});

function displayArticle(article) {
    const articleContainer = document.getElementById('article-container');

    articleContainer.innerHTML = `
        <img class="article-img-cover" src='../images/articles/article-${article.articleID}/${article.imageFileNames[0]}'></img>
        <h1 class="article-title">${article.Title}</h1>
        <p class="article-author"><strong>Author:</strong> ${article.Author}</p>
        <p class="article-country"><strong>Country:</strong> ${article.Country}</p>
        <p class="article-publisher"><strong>Publisher:</strong> ${article.Publisher}</p>
        <p class="article-sector"><strong>Sector:</strong> ${article.Sector}</p>
        <p class="article-tags"><strong>Tags:</strong> ${article.Tags}</p>
        <button class="edit-tags-btn" data-article-id="${article.articleID}">Edit Tags</button>
        <div id="edit-tags-container"></div> <!-- Container for the input field -->
        <button class="delete-article-btn" data-article-id="${article.articleID}">Delete</button>
        <div class="article-body">${article.Body}</div>
        <img class="article-img-1" src='../images/articles/article-${article.articleID}/${article.imageFileNames[1]}'></img>
        <img class="article-img-2" src='../images/articles/article-${article.articleID}/${article.imageFileNames[2]}'></img>
    `;

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
