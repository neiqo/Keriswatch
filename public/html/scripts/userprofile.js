document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem('token');
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
      

    // Display user details and profile picture
    const user1 = await fetchUserDetails(username);
    if (user1) {
        document.getElementById('profile_username').textContent = 'Hello, ' + user1.username + '!';

        console.log("username @ user1: " + username);

        const profilePicture = await fetchProfilePicture(username);

        console.log("Profile picture: " + profilePicture);

        const profilePictureElement = document.getElementById('account-profile-picture');
        if (profilePicture) {
            profilePictureElement.src = `data:image/png;base64,${profilePicture}`;
        } else {
            profilePictureElement.src = `./images/profile-pictures/defaultProfile.png`;
        }
    }

    // Populate the form with existing details
    const user = await fetchUserDetails(username);
    if (user) {
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        if (document.getElementById('country-selector')) {
            document.getElementById('country-selector').value = user.country;
        }
    }

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
});
