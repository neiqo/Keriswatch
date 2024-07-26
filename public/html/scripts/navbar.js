document.addEventListener("DOMContentLoaded", function() {
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
    brandLink.href = 'index.html';
    const brandImg = document.createElement('img');
    brandImg.src = './images/keriswatch.png';
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
        { text: 'News', href: '#', active: false },
        { text: 'Events', href: '#', active: false},
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

    // // Add notifications dropdown
    // const notificationsItem = document.createElement('li');
    // notificationsItem.className = 'nav-item dropdown';
    // const notificationsLink = document.createElement('a');
    // notificationsLink.className = 'nav-link dropdown-toggle hidden-arrow';
    // notificationsLink.href = '#';
    // notificationsLink.id = 'navbarDropdown';
    // notificationsLink.role = 'button';
    // notificationsLink.setAttribute('data-mdb-toggle', 'dropdown');
    // notificationsLink.setAttribute('aria-expanded', 'false');
    // const bellIcon = document.createElement('i');
    // bellIcon.className = 'fas fa-bell';
    // notificationsLink.appendChild(bellIcon);
    // notificationsItem.appendChild(notificationsLink);
    // const notificationsMenu = document.createElement('ul');
    // notificationsMenu.className = 'dropdown-menu dropdown-menu-end notifications-list p-1';
    // notificationsMenu.setAttribute('aria-labelledby', 'navbarDropdown');
    // notificationsItem.appendChild(notificationsMenu);

    // // Notifications dropdown items
    // const notifications = [
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Slides/img%20(15).jpg', title: 'New', subtitle: 'Movie title', time: 'Today' },
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Slides/img%20(10).jpg', title: 'New', subtitle: 'Movie title', time: 'Today' },
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Slides/img%20(11).jpg', title: 'New', subtitle: 'Movie title', time: 'Today' },
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Slides/img%20(20).jpg', title: 'New', subtitle: 'Movie title', time: 'Today' },
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Slides/img%20(5).jpg', title: 'New', subtitle: 'Movie title', time: 'Today' },
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Slides/img%20(15).jpg', title: 'New', subtitle: 'Movie title', time: 'Today' }
    // ];

    // notifications.forEach(notification => {
    //     const li = document.createElement('li');
    //     const row = document.createElement('div');
    //     row.className = 'row';
    //     const colImg = document.createElement('div');
    //     colImg.className = 'col-md';
    //     const img = document.createElement('img');
    //     img.src = notification.imgSrc;
    //     img.height = 63;
    //     img.width = 'auto';
    //     img.className = 'd-block';
    //     img.alt = '...';
    //     colImg.appendChild(img);
    //     row.appendChild(colImg);
    //     const colText = document.createElement('div');
    //     colText.className = 'col-md';
    //     const pTitle = document.createElement('p');
    //     pTitle.className = 'h6 mb-0';
    //     pTitle.textContent = notification.title;
    //     const pSubtitle = document.createElement('p');
    //     pSubtitle.className = 'h6 mb-1';
    //     pSubtitle.textContent = notification.subtitle;
    //     const spanTime = document.createElement('span');
    //     spanTime.className = 'small';
    //     spanTime.textContent = notification.time;
    //     colText.appendChild(pTitle);
    //     colText.appendChild(pSubtitle);
    //     colText.appendChild(spanTime);
    //     row.appendChild(colText);
    //     li.appendChild(row);
    //     notificationsMenu.appendChild(li);
    //     const divider = document.createElement('li');
    //     divider.appendChild(document.createElement('hr'));
    //     divider.className = 'dropdown-divider';
    //     notificationsMenu.appendChild(divider);
    // });

    // navbarListRight.appendChild(notificationsItem);

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
    const defaultUserImg = './images/defaultProfile.png';
    const defaultUserName = 'Guest';

    // Check if user is logged in (example check)
    const isLoggedIn = true; // Replace with your actual logic to check if user is logged in

    if (isLoggedIn) {
        // User is logged in (example scenario)
        const userImg = 'https://mdbootstrap.com/img/Photos/Avatars/img%20(2).jpg'; // Replace with actual user image
        const userName = 'John Doe'; // Replace with actual user name
        const userImgElem = document.createElement('img');
        userImgElem.src = userImg;
        userImgElem.className = 'rounded-circle img-fluid me-1';
        userImgElem.height = 25;
        userImgElem.width = 25;
        userLink.appendChild(userImgElem);
        const userNameElem = document.createElement('span');
        userNameElem.textContent = userName;
        userLink.appendChild(userNameElem);
    } else {
        // User is not logged in
        const defaultUserImgElem = document.createElement('img');
        defaultUserImgElem.src = defaultUserImg;
        defaultUserImgElem.className = 'rounded-circle img-fluid me-1';
        defaultUserImgElem.height = 25;
        defaultUserImgElem.width = 25;
        userLink.appendChild(defaultUserImgElem);
        const defaultUserNameElem = document.createElement('span');
        defaultUserNameElem.textContent = defaultUserName;
        userLink.appendChild(defaultUserNameElem);
    }

    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
    dropdownMenu.setAttribute('aria-labelledby', 'navbarDropdown');
    userItem.appendChild(dropdownMenu);

    // Add dropdown items
    const accountItems = [
        { text: 'Your Account', href: '#' },
        { text: 'Help', href: '#' },
        { text: 'Log Out', href: '#', id: 'logout' }
    ];

    accountItems.forEach(item => {
        const dropdownItem = document.createElement('a');
        dropdownItem.className = 'dropdown-item';
        dropdownItem.href = item.href;
        dropdownItem.textContent = item.text;
        dropdownMenu.appendChild(dropdownItem);
    });


    const logoutItem = document.getElementById('logout');
    if (logoutItem) {
        logoutItem.addEventListener('click', async (event) => {
            event.preventDefault();
            await logoutUser();
        });
    }

    async function logoutUser() {
        try {
            // Clear the token from localStorage
            localStorage.removeItem('token');
    
            // Call the API logout function
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (response.ok) {
                // Redirect to the login page or home page
                window.location.href = './index.html';
                window.alert('Logged out successfully');
                
            } else {
                console.error('Failed to log out');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    navbarListRight.appendChild(userItem);

    // // User dropdown items
    // const users = [
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Avatars/img%20(4).jpg', name: 'User 1' },
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Avatars/img%20(6).jpg', name: 'User 2' },
    //     { imgSrc: 'https://mdbootstrap.com/img/Photos/Avatars/img%20(3).jpg', name: 'User 3' }
    // ];

    // users.forEach(user => {
    //     const li = document.createElement('li');
    //     li.className = 'my-2 d-flex align-items-center';
    //     const img = document.createElement('img');
    //     img.src = user.imgSrc;
    //     img.className = 'rounded-circle img-fluid me-1';
    //     img.height = 25;
    //     img.width = 25;
    //     li.appendChild(img);
    //     const span = document.createElement('span');
    //     span.textContent = user.name;
    //     li.appendChild(span);
    //     userMenu.appendChild(li);
    // });

    // const manageProfiles = document.createElement('li');
    // const manageLink = document.createElement('a');
    // manageLink.className = 'dropdown-item';
    // manageLink.href = '#';
    // manageLink.textContent = 'Manage Profiles';
    // manageProfiles.appendChild(manageLink);
    // userMenu.appendChild(manageProfiles);
    // const divider = document.createElement('li');
    // divider.appendChild(document.createElement('hr'));
    // divider.className = 'dropdown-divider';
    // userMenu.appendChild(divider);

    // const accountItems = [
    //     { text: 'Your Account', href: '#' },
    //     { text: 'Help', href: '#' },
    //     { text: 'Log Out', href: '#' }
    // ];

    // accountItems.forEach(item => {
    //     const li = document.createElement('li');
    //     const a = document.createElement('a');
    //     a.className = 'dropdown-item';
    //     a.href = item.href;
    //     a.textContent = item.text;
    //     li.appendChild(a);
    //     userMenu.appendChild(li);
    // });

    // navbarListRight.appendChild(userItem);

    // Append the navbar to the body
    document.body.appendChild(navbar);

    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
    
        const formData = new FormData(this); // Get form data
        const searchParams = new URLSearchParams(formData); // Convert to URL-encoded string
    
        // Redirect to searchpage.html with search parameters
        window.location.href = `searchpage.html?${searchParams.toString()}`;
    });
});

