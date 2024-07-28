document.addEventListener("DOMContentLoaded", async function() {
    let tokenObj = localStorage.getItem('token') || null;
    let token = null;
    if (tokenObj) {
        tokenObj = JSON.parse(tokenObj);
        token = tokenObj.token;
    }   
    if (!token) {
        console.error('No token found');
        return;
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
            filterAndDisplayArticles(selectedCountry, articles, bookmarkedArticleIds, token);
        });
  
        // Initial load
        const defaultCountry = countrySelector.value;
        filterAndDisplayArticles(defaultCountry, articles, bookmarkedArticleIds, token);
  
        // Display the most recent articles
        displayRecentArticles(articles, 'latest-news', 4, bookmarkedArticleIds, token);
  
    } catch (error) {
        console.error('Error fetching articles:', error);
        alert('Error fetching articles. Please try again later.');
    }

    // Decode JWT
    const decoded = jwt_decode(token);
    const username = decoded.username;

    // Function to fetch user profile picture
    async function fetchProfilePicture(username) {
        try {
            const response = await fetch(`/api/users/${username}/profilePicture`);
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error('Failed to fetch profile picture');
                return null;
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            return null;
        }
    }

    // Function to fetch user details with proper headers
    async function fetchUserDetails(username) {
        try {
            const response = await fetch(`/api/users/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const user = await response.json();
                return user;
            } else {
                console.error('Failed to fetch user details');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    }

    // Display user details and profile picture
    const user1 = await fetchUserDetails(username);
    if (user1) {
        document.getElementById('profile_username').textContent = 'Hello, ' + user1.username + '!';

        console.log("username @ user1: " + username);

        const profilePicture = await fetchProfilePicture(username);

        console.log("Profile picture: " + profilePicture);

        const profilePictureElement = document.getElementById('account-profile-picture');
        if (profilePictureElement) {
            if (profilePicture) {
                profilePictureElement.src = `data:image/png;base64,${profilePicture}`;
            } else {
                profilePictureElement.src = `./images/profile-pictures/defaultProfile-black.png`;
            }
        } else {
            console.error('Profile picture element not found');
        }
    }
});

document.getElementById('view-users-btn').addEventListener('click', function() {
    window.location.href = '/viewallusers.html';
});

function displayArticles(articles, elementId, bookmarkedArticleIds, token) {
    const articlesList = document.getElementById(elementId);
    
    if (!articlesList) {
        console.error(`Element with ID ${elementId} not found`);
        return;
    }

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
  
        /* if (token) {
            // Create bookmark button with event listener if user is logged in
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
        }*/
  
        articlesList.appendChild(articleElement);
    });
  }
  
  function displayRecentArticles(articles, elementId, numArticles, bookmarkedArticleIds, token) {
    // Sort articles by date in descending order
    const sortedArticles = articles.sort((a, b) => new Date(b.PublishedDate) - new Date(a.PublishedDate));
  
    // Select the top 'numArticles' recent articles
    const recentArticles = sortedArticles.slice(0, numArticles);
  
    // Display the recent articles
    displayArticles(recentArticles, elementId, bookmarkedArticleIds, token);
  }

  