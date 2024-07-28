

// document.addEventListener('DOMContentLoaded', function() {
//     Array.from(document.querySelectorAll('.form-outline')).forEach(formOutline => {
//         new mdb.Input(formOutline).init();
//     });
// });

// const { response } = require("express");

async function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log(email);
    console.log(password);
    
    await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert('Invalid email or password');
                throw new Error('Error logging in:', response.status);
            }
        }
        )
        .then(token => {
            token = JSON.stringify(token);
            localStorage.setItem('token', token);
            console.log("token in loginUser: " + token);

            // After storing the token in localStorage, clear the input fields
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            alert('Logged in successfully!');
            window.location.href = '/index.html';
        })
        .catch(error => {
            console.error(error);
            alert('Error logging in:', error);
        });
}

function showSignupOptions() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-options').style.display = 'block';
    document.getElementById('welcome').style.display = 'none';
}

let role = null;

function showSignupForm(type) {
    document.getElementById('signup-options').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';

    const title = document.getElementById('signup-form-title');
    const additionalField = document.getElementById('additional-field');

    const countries = {
        Brunei: 'Brunei',
        Cambodia: 'Cambodia',
        Indonesia: 'Indonesia',
        Laos: 'Laos',
        Malaysia: 'Malaysia',
        Myanmar: 'Myanmar',
        Philippines: 'Philippines',
        Singapore: 'Singapore',
        Thailand: 'Thailand',
        Vietnam: 'Vietnam',
    }
    
    additionalField.innerHTML = ''; // Clear existing content

    if (type === 'user') {
        title.textContent = 'Sign Up as User';

        role = "NormalUser";

        const selectCountry = document.createElement('select');
        selectCountry.id = 'signup-country';
        selectCountry.className = 'form-control';
        additionalField.appendChild(selectCountry);

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Country';
        selectCountry.appendChild(defaultOption);

        for (let country in countries) {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            selectCountry.appendChild(option);
        }

        const labelCountry = document.createElement('label');
        labelCountry.setAttribute('for', 'signup-country');
        labelCountry.className = 'form-label';
        labelCountry.textContent = 'Country';
        additionalField.appendChild(labelCountry);

    } else if (type === 'organisation') {
        title.textContent = 'Sign Up as Organisation';
        // additionalField.innerHTML = `
        // <input type="text" id="signup-org-number" class="form-control" />
        // <label class="form-label" for="signup-org-number">Organisation Number</label>
        // `;

        role = "Organisation";

        const orgNumberInput = document.createElement('input');
        orgNumberInput.type = 'text';
        orgNumberInput.id = 'signup-org-number';
        orgNumberInput.className = 'form-control mt-3';
        additionalField.appendChild(orgNumberInput);

        const orgNumberLabel = document.createElement('label');
        orgNumberLabel.setAttribute('for', 'signup-org-number');
        orgNumberLabel.className = 'form-label';
        orgNumberLabel.textContent = 'Organisation Number';
        additionalField.appendChild(orgNumberLabel);
    }

    // // Initialize the dynamically added form fields
    // setTimeout(() => {
    //     Array.from(document.querySelectorAll('.form-outline')).forEach(formOutline => {
    //         new mdb.Input(formOutline).init();
    //     });
    // }, 0);
}

async function signupUser() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const country = document.getElementById('signup-country') ? document.getElementById('signup-country').value : null;
    const orgNumber = document.getElementById('signup-org-number') ? document.getElementById('signup-org-number').value : null;
    const profilePicture = document.getElementById('profile-picture').files[0];

    // const formData = new FormData();
    // formData.append('username', username);
    // formData.append('email', email);
    // formData.append('password', password);
    // formData.append('role', role);
    // if (country) formData.append('country', country);
    // if (orgNumber) formData.append('orgNumber', orgNumber);
    // if (profilePicture) formData.append('profilePicture', profilePicture);

    const rolePath = role === 'NormalUser' ? 'normal' : 'organisation';

    console.log("Profile Picture in login.js: " + profilePicture);
    
    console.log(rolePath);

    const user = {
        username: username,
        password: password,
        email: email,
        role: role,
    };

    if (country) user['country'] = country;
    if (orgNumber) user['orgNumber'] = orgNumber;

    const reader = new FileReader();
    reader.onloadend = async function() {
        const profilePictureImageBase64 = reader.result;

        user['profilePicture'] = profilePictureImageBase64;

        try {
            const response = await fetch(`/api/signup/${rolePath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                throw new Error('Error signing up:', response.status);
            }

            const responseData = await response.json();
            console.log(responseData.message);
            const token = JSON.stringify(responseData['token']);
            console.log("Token when signing up: " + token);
            localStorage.setItem('token', token);

            await alert('User created successfully!');
            // window.location.reload();
            window.location.href = '/index.html';
        } catch (error) {
            alert('Unable to sign up:', error);
        }
    };

    if (profilePicture) {
        reader.readAsDataURL(profilePicture);
    }
    else {                    
        try {
            const response = await fetch(`/api/signup/${rolePath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                throw new Error('Error signing up:', response.status);
            }

            const responseData = await response.json();
            console.log(responseData.message);
            const token = JSON.stringify(responseData['token']);
            console.log("Token when signing up: " + token);
            localStorage.setItem('token', token);

            await alert('User created successfully!');
            // window.location.reload();
            window.location.href = '/index.html';
        } catch (error) {
            alert('Unable to sign up:', error);
        }
        console.log("Default profile picture used."); // This will be the base64 encoded image
    }

    // await fetch(`/api/signup/${rolePath}`, {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => {
    //     if (!response.ok) {
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    //     return response.json();
    // })
    // .then(data => {
    //     console.log("Token: " + data.token);
    //     localStorage.setItem('token', data.token);
        
    //     // Clear input fields
    //     document.getElementById('signup-username').value = '';
    //     document.getElementById('signup-email').value = '';
    //     document.getElementById('signup-password').value = '';
    //     if(document.getElementById('signup-country')) document.getElementById('signup-country').value = '';
    //     if(document.getElementById('signup-org-number')) document.getElementById('signup-org-number').value = '';
    //     document.getElementById('profile-picture').value = '';
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
}
