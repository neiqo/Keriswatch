// import jwt_decode from 'jwt-decode'; // Import the jwt-decode module

// const { log } = require("console");

document.addEventListener("DOMContentLoaded", async function() {
    // Function to fetch user profile picture
    async function fetchProfilePicture(username) {
        const tokenObj = JSON.parse(localStorage.getItem('token'));
        const token = tokenObj ? tokenObj.token : null;
        if (!token) return null;

        try {
            const response = await fetch(`/api/users/${username}/profilePicture`);

            if (response.ok) {
                if (response == null) {
                    console.log("Use default profile picture");
                    return null;
                }
                console.log("Response : " + response);

                const data = await response.json();
                if (data === null) {
                    console.log("Profile picture not found, using default");
                    return null;
                }
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

    // Create the navbar element
    const navbar = document.createElement('nav');
    navbar.className = 'navbar navbar-expand-lg fixed-top navbar-light bg-light';

    // Create the container
    const container = document.createElement('div');
    container.className = 'container-fluid';
    navbar.appendChild(container);

    // Create the brand link
    const brandLink = document.createElement('a');
    brandLink.className = 'navbar-brand';
    brandLink.href = '/index.html';
    brandLink.href = '/index.html';
    const brandImg = document.createElement('img');
    brandImg.src = '/images/keriswatch.png';
    brandImg.src = '/images/keriswatch.png';
    brandImg.height = 30;
    brandImg.alt = 'Keriswatch Logo';
    brandImg.loading = 'lazy';
    brandLink.appendChild(brandImg);
    container.appendChild(brandLink);

    // Create the toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'navbar-toggler';
    toggleButton.type = 'button';
    toggleButton.setAttribute('data-mdb-toggle', 'collapse');
    toggleButton.setAttribute('data-mdb-target', '#navbarSupportedContent');
    toggleButton.setAttribute('aria-controls', 'navbarSupportedContent');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'Toggle navigation');
    const toggleIcon = document.createElement('i');
    toggleIcon.className = 'fas fa-bars';
    toggleButton.appendChild(toggleIcon);
    container.appendChild(toggleButton);

    // Create the collapsible wrapper
    const collapseDiv = document.createElement('div');
    collapseDiv.className = 'collapse navbar-collapse';
    collapseDiv.id = 'navbarSupportedContent';
    container.appendChild(collapseDiv);

    // Create the navbar links list
    const navbarList = document.createElement('ul');
    navbarList.className = 'navbar-nav me-auto mb-2 mb-lg-0 navbar-light';
    collapseDiv.appendChild(navbarList);

    // List items for navbar links
    const navItems = [
        { text: 'News', href: '/articleSearchPage.html', active: false },
        { text: 'Events', href: '/events.html', active: false },
        { text: 'News', href: '/articleSearchPage.html', active: false },
        { text: 'Events', href: '/events.html', active: false },
    ];

    navItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        const a = document.createElement('a');
        a.className = 'nav-link text-white';
        if (item.active) a.className += ' active';
        a.href = item.href;
        a.textContent = item.text;
        li.appendChild(a);
        navbarList.appendChild(li);
    });

    // Create the search form
    const searchForm = document.createElement('form');
    searchForm.id = 'searchForm';  // Add the ID here
    searchForm.className = 'form-inline my-2 my-lg-0 ml-auto';
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'form-control mr-sm-2';
    searchInput.placeholder = 'Search';
    searchInput.name = 'query';  // Make sure the name attribute matches
    searchForm.appendChild(searchInput);
    const searchButton = document.createElement('button');
    searchButton.className = 'btn btn-outline-success my-2 my-sm-0';
    searchButton.type = 'submit';
    searchButton.innerHTML = '<i class="fas fa-search"></i>';
    searchForm.appendChild(searchButton);
    collapseDiv.appendChild(searchForm);
    // Create additional navbar links list
    const navbarListRight = document.createElement('ul');
    navbarListRight.className = 'navbar-nav mb-2 mb-lg-0';
    collapseDiv.appendChild(navbarListRight);

    // Create user dropdown
    const userItem = document.createElement('li');
    userItem.className = 'nav-item dropdown';

    // Create user link
    const userLink = document.createElement('a');
    userLink.className = 'nav-link dropdown-toggle text-white';
    userLink.href = '#';
    userLink.id = 'navbarDropdown';
    userLink.role = 'button';
    userLink.setAttribute('data-toggle', 'dropdown');
    userLink.setAttribute('aria-haspopup', 'true');
    userLink.setAttribute('aria-expanded', 'false');
    userItem.appendChild(userLink);

    // Default guest profile image
    const defaultUserImg = '/images/profile-pictures/defaultProfile.png';
    const defaultUserName = 'Guest';

    // Check if user is logged in
    const tokenObj = JSON.parse(localStorage.getItem('token'));
    const token = tokenObj ? tokenObj.token : null;
    let isLoggedIn = false;
    let profilePictureUrl = defaultUserImg;
    let username = defaultUserName;
    let role = "NormalUser"

    if (token) {
        try {
            // Log the content of the token before decoding
            console.log('Token:', token);
            
            const payload = jwt_decode(token);
            console.log(payload);
            isLoggedIn = true;
            username = payload.username;
            role = payload.role;
            const profilePicture = await fetchProfilePicture(username);
            profilePictureUrl = profilePicture ? `data:/image/png;base64,${profilePicture}` : defaultUserImg;
        } catch (error) {
            console.error('Error parsing token:', error);
        }
    }

    const userImgElem = document.createElement('img');
    userImgElem.src = profilePictureUrl;
    userImgElem.className = 'rounded-circle img-fluid me-1';
    userImgElem.height = 25;
    userImgElem.width = 25;
    userLink.appendChild(userImgElem);

    const userNameElem = document.createElement('span');
    userNameElem.textContent = username;
    userLink.appendChild(userNameElem);

    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
    dropdownMenu.setAttribute('aria-labelledby', 'navbarDropdown');
    userItem.appendChild(dropdownMenu);

    // Add dropdown items
    const accountItems = [];

    if (token) {
        if (role == "Organisation"){
            accountItems.push(
                { text: 'Organisation Dashboard', href: 'organisation.html' },
                { text: 'Log Out', href: '#', id: 'logout' }
            );
        } else {
            accountItems.push(
                { text: 'Your Account', href: 'user.html' },
                { text: 'Log Out', href: '#', id: 'logout' }
            );
        }
    } else {
        accountItems.push({ text: 'Log In', href: '/login.html' });
        accountItems.push({ text: 'Log In', href: '/login.html' });
    }
    
    accountItems.forEach(item => {
        const dropdownItem = document.createElement('a');
        dropdownItem.className = 'dropdown-item';
        dropdownItem.href = item.href;
        dropdownItem.textContent = item.text;

        if (item.id) {
            dropdownItem.id = item.id;
        }

        if (item.class) {
            dropdownItem.className += item.class;
        }
        dropdownMenu.appendChild(dropdownItem);

        // Attach event listener if the item is the logout button
        if (item.id === 'logout') {
            dropdownItem.addEventListener('click', async (event) => {
                event.preventDefault();
                await logoutUser();
            });
        }
    });

    async function logoutUser() {
        try {
            // Call the API logout function
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Clear the token from localStorage
                localStorage.removeItem('token');
                window.alert('Logged out successfully');

                // Redirect to the login page or home page
                window.location.href = './index.html';
            } else {
                console.error('Failed to log out');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    navbarListRight.appendChild(userItem);

    // Append the navbar to the body
    document.body.appendChild(navbar);

    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
    
        const formData = new FormData(this); // Get form data
        const searchParams = new URLSearchParams(formData); // Convert to URL-encoded string
    
        // Redirect to searchpage.html with search parameters
        window.location.href = `/articleSearchPage.html?${searchParams.toString()}`;
        window.location.href = `/articleSearchPage.html?${searchParams.toString()}`;
    });
});

