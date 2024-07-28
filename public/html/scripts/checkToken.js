
document.addEventListener('DOMContentLoaded', () => {
    async function checkTokenExpiry() {
        let tokenObj = localStorage.getItem('token') || null;  // This will store the user's JWT after login
        if (!tokenObj) {
            // No token found, user is already logged out
            return;
        }   
        tokenObj = JSON.parse(tokenObj);
        const token = tokenObj.token;

        if (!token) {
            // No token found, user is already logged out
            return;
        }
    
        const decoded = jwt_decode(token);  
        const tokenExpiry = decoded.exp * 1000; // Expiry time is in seconds, convert to milliseconds
        const currentTime = Date.now();
    
        if (currentTime >= tokenExpiry) {
            // Token has expired
            await fetch('/api/token', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }}); // Send a request to delete the token from the server
            localStorage.removeItem('token');
            alert('Your session has expired. You will be logged out.');
            window.location.href = "./index.html"; // Refresh the page
        }
    }

    // Call this function immediately to check for token expiry on page load
    checkTokenExpiry();
    // Call this function periodically to check for token expiry
    setInterval(checkTokenExpiry, 60000); // Check every 60 seconds
});

