
document.addEventListener('DOMContentLoaded', () => {
    function checkTokenExpiry() {
        const token = localStorage.getItem('token');
        if (!token) {
            // No token found, user is already logged out
            return;
        }
    
        const decoded = jwt_decode(token);  
        const tokenExpiry = decoded.exp * 1000; // Expiry time is in seconds, convert to milliseconds
        const currentTime = Date.now();
    
        if (currentTime >= tokenExpiry) {
            // Token has expired
            localStorage.removeItem('token');
            alert('Your session has expired. You will be logged out.');
            window.location.reload(); // Refresh the page
        }
    }

    // Call this function immediately to check for token expiry on page load
    checkTokenExpiry();
    // Call this function periodically to check for token expiry
    setInterval(checkTokenExpiry, 60000); // Check every 60 seconds
});

