document.addEventListener("DOMContentLoaded", async function() {
    let tokenObj = localStorage.getItem('token') || null;
    let token = null;
    if (tokenObj) {
        tokenObj = JSON.parse(tokenObj);
        token = tokenObj.token;
        if (!token) {
            token = tokenObj; //tokenObj is a string
        }
    }   
    if (!token) {
        console.error('No token found');
        return;
    }

    // Decode JWT
    const decoded = jwt_decode(token);
    const username = decoded.username;

    console.log("Decoded username in userprofile: " + decoded.username);
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

    // For updating user details

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
                        const responseData = await response.json();
                        console.log('Successfully updated user.');
                        console.log('Response Data:', responseData); // Log the entire response data

                        const token = responseData.token; // Access the token directly
                        console.log("Token when updating account details: " + token);

                        if (token) {
                            localStorage.setItem('token', token);
                        } else {
                            console.warn('Token is undefined in the response data.');
                        }
            
                        await alert('User updated successfully!');
                        modal.style.display = "none";
                        window.location.reload();
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

        console.log("File: " + file);
        if (file) {
            // Upload logic here!
            let userDetails = {
                oldUsername: username
            };
            const reader = new FileReader();
            reader.onloadend = async function() {
                const profilePictureImageBase64 = reader.result;
        
                userDetails['profilePicture'] = profilePictureImageBase64;
        
                try {
                    const rolePath = decoded.role === 'NormalUser' ? 'normal' : 'organisation';
                    const response = await fetch(`/api/update/normal`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(userDetails)
                    });
        
                    if (!response.ok) {
                        throw new Error('Error signing up:', response.status);
                    }
        
                    const responseData = await response.json();
                    console.log(responseData.message);
                    const token = JSON.stringify(responseData['token']);
                    console.log("Token when uploading new profile picture: " + token);
                    localStorage.setItem('token', token);
        
                    alert("Profile picture uploaded successfully!");
                    window.location.reload();
                } catch (error) {
                    alert('Unable to update profile picture: ', error);
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select a picture to upload.");
        }

        // Close the modal
        profilePicModal.style.display = "none";
    }

    
});
