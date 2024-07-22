// fetch('/api/data', {
//     method: 'POST', // Specify the request method
//     // Additional configuration options can be added here
// })
//     .then(response => response.json())
//     .then(data => {
//         // Process the data received from the backend
//         console.log(data);
//     })
//     .catch(error => {
//         // Handle any errors that occurred during the request
//         console.error(error);
//     });

async function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log(email);
    console.log(password);
    
    await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => response.json())
        .then(token => {
            // Process the token received from the backend
            console.log(token);
        })
        .catch(error => {
            // Handle any errors that occurred during the request
            console.error(error);
        });
}