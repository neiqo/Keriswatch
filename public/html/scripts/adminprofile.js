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
            profilePictureElement.src = `./images/profile-pictures/defaultProfile-black.png`;
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

});

document.getElementById('view-users-btn').addEventListener('click', function() {
    window.location.href = '/viewallusers.html';
});