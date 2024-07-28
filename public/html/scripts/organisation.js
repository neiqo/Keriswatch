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

    // Function to fetch articles by publisher name
    async function fetchArticlesByPublisher(publisher) {
        try {
            const response = await fetch(`/search?query=${publisher}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const articles = await response.json();
                return articles;
            } else {
                console.error('Failed to fetch articles');
                return [];
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            return [];
        }
    }

    // Display user details and profile picture
    const user1 = await fetchUserDetails(username);
    if (user1) {
        document.getElementById('profile_username').textContent = 'Hello, ' + user1.username + '!';

        const profilePicture = await fetchProfilePicture(username);
        const profilePictureElement = document.getElementById('account-profile-picture');
        if (profilePicture) {
            profilePictureElement.src = `data:image/png;base64,${profilePicture}`;
        } else {
            profilePictureElement.src = './images/profile-pictures/defaultProfile-black.png'; // Provide default image path
        }

        // Display user's email and country
        document.getElementById('email').value = user1.email;
        document.getElementById('country-selector').value = user1.country;
    }

    // Fetch and display articles
    const articles = await fetchArticlesByPublisher(username);
    const articlesList = document.getElementById('articles-list');
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
        articlesList.appendChild(articleElement);
    });

    // Handle profile update functionality
    // Get the modal
    var modal = document.getElementById("myModal");
    var btn = document.getElementById("edit-profile-btn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open or close the modal 
    btn.onclick = function() {
        modal.style.display = "block";
    }
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Update button click event
    document.getElementById("update-btn").onclick = function() {
        var emailElement = document.getElementById("email");
        var passwordElement = document.getElementById("password");
        var countryElement = document.getElementById("country-selector");

        if (emailElement && passwordElement && countryElement) {
            var email = emailElement.value;
            var password = passwordElement.value;
            var country = countryElement.value;

            if (confirm("Do you want to update your details?")) {
                fetch('/api/update/normal', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        oldUsername: username,  // Use the decoded username
                        email: email,
                        password: password,
                        country: country
                    })
                })
                .then(async response => {
                    // Check if the response is JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        console.log('Success:', data);
                        modal.style.display = "none";
                    } else {
                        // Handle unexpected response
                        const text = await response.text();
                        console.error('Unexpected response format:', text);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        } else {
            console.error('One or more input elements are missing');
        }
    }

    // For updating user profile picture
    var profilePicModal = document.getElementById("profilePicModal");
    var editPicBtn = document.getElementById("edit-pic-btn");
    var closeProfilePic = document.getElementById("close-profile-pic");

    // When the user clicks on the button, open the respective modal
    editPicBtn.onclick = function() {
        profilePicModal.style.display = "block";
    }

    closeProfilePic.onclick = function() {
        profilePicModal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modals, close them
    window.onclick = function(event) {
        if (event.target == profilePicModal) {
            profilePicModal.style.display = "none";
        }
    }

    // Handle the upload picture button click
    document.getElementById("upload-pic-btn").onclick = function() {
        var fileInput = document.getElementById("profile-pic");
        var file = fileInput.files[0];

        if (file) {
            // Upload logic here!

            alert("Profile picture uploaded successfully!");
        } else {
            alert("Please select a picture to upload.");
        }

        // Close the modal
        profilePicModal.style.display = "none";
    }
});
