document.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch('/api/users');
        console.log(response);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        const tableBody = document.querySelector('#users-table tbody');

        users.forEach(user => {
            console.log(user);
            const row = document.createElement('tr');

            const usernameCell = document.createElement('td');
            usernameCell.textContent = user.username;
            row.appendChild(usernameCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = user.email;
            row.appendChild(emailCell);

            const countryCell = document.createElement('td');
            countryCell.textContent = user.country ? user.country : '-';
            row.appendChild(countryCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
});
