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
                return data.profilePicture;
            } else {
                console.error('Failed to fetch profile picture');
                return null;
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
            return null;
        }
    }

    // Function to fetch user details
    async function fetchUserDetails(username) {
        try {
            const response = await fetch(`/api/users/${username}`);
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

    // Function to delete user
    async function deleteUser(username) {
        const confirmed = confirm("Are you sure you want to delete your account?");
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('User deleted successfully');
                // Redirect to homepage or login page
                window.location.href = '/login.html';
            } else {
                console.error('Failed to delete user');
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    }

    // Display user details and profile picture
    const user = await fetchUserDetails(username);
    if (user) {
        document.getElementById('username').textContent = 'Hello,' + user.username + '!';
        const profilePicture = await fetchProfilePicture(username);
        if (profilePicture) {
            document.getElementById('profile-picture').src = `data:image/jpeg;base64,${profilePicture}`;
        }
    }

    // Add event listener to delete button
    document.getElementById('delete-user-btn').addEventListener('click', function() {
        deleteUser(username);
    });
});
