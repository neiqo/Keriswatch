// Purpose: To create a new event and send it to the server


// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
    'use strict';

    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');

        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                } 
                else {
                    event.preventDefault(); // Prevent default form submission
                    handleCreateClick(event); // Call custom form submission handler
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

// Access the buttons
const createButton = document.querySelector('.btn-primary[type="submit"]');
const cancelButton = document.getElementById('CancelButton');

// Define the function for the Create button
function handleCreateClick(event) {
    event.preventDefault(); // Prevent form submission if necessary
    // Logic to handle creation
    
    getValue();
    console.log('Create button clicked');
    // Example: Collect form data and send it to a server
}

// Define the function for the Cancel button
function handleCancelClick() {
    // Logic to handle cancellation
    console.log('Cancel button clicked');
    cancel();
    window.history.back();  // Navigate to the previous page
    // Example: Clear the form or redirect
}

// Init form
let form = document.getElementById("event-form");


function getValue() {

    // Event values
    let nameValue = form.elements['name'].value;
    let descriptionValue = form.elements['description'].value;
    let categoryValue = form.elements['category'].value;
    let startdateValue = form.elements['startdate'].value;
    let enddateValue = form.elements['enddate'].value;
    
    // Location values
    let locationNameValue = form.elements['locationName'].value;
    let addressValue = form.elements['address'].value;
    let postalCodeValue = form.elements['postalCode'].value;
    let countryValue = form.elements['country'].value;
    let totalCapacityValue = form.elements['totalCapacity'].value;

    // Image file
    let imagefile = form.elements['image'].files[0];

    // Validate startdate and enddate
    if (!validateDates(startdateValue, enddateValue)) {
        console.error("Start date must be before end date and dates must be valid.");
        return; // Exit the function if validation fails
    }

    console.log(nameValue);
    console.log(descriptionValue);
    console.log(categoryValue);
    console.log(startdateValue);
    console.log(enddateValue);
    console.log(imagefile);
    console.log(locationNameValue);
    console.log(addressValue);
    console.log(postalCodeValue);
    console.log(countryValue);
    // createLocation(locationNameValue, addressValue, postalCodeValue, countryValue);
    createEvent(
        nameValue,
        descriptionValue,
        categoryValue,
        startdateValue,
        enddateValue,
        imagefile,
        locationNameValue,
        addressValue,
        postalCodeValue,
        countryValue,
        totalCapacityValue
    );
}


function validateDates(startdate, enddate) {
    let startDate = new Date(startdate);
    let endDate = new Date(enddate);
    let today = new Date();
    
    // Remove time part from today's date
    today.setHours(0, 0, 0, 0);

    // Check if start date is before today
    if (startDate < today) {
        alert("Start date cannot be earlier than today.");
        return false; // Start date is earlier than today
    }

    // Check if start date is before end date
    if (startDate > endDate) {
        alert("Start date must be before end date.");
        return false; // Invalid dates
    }
    return true; // Valid dates
}

async function createEvent(name, description, category, startdate, enddate, imagefile, locationName, address, postalCode, country, totalCapacity) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("categoryId", category);
    formData.append("startDate", startdate);
    formData.append("endDate", enddate);
    formData.append("image", imagefile); // Assuming imageFile is the File object

    console.log(`Type of locationName: ${typeof locationName}`);
    console.log(`Type of address: ${typeof address}`);
    console.log(`Type of postalCode: ${typeof postalCode}`);
    console.log(`Type of country: ${typeof country}`);

    // Append location details
    formData.append("locationName", locationName);
    formData.append("address", address);
    formData.append("postalCode", postalCode);
    formData.append("country", country);
    formData.append("totalCapacity", totalCapacity);

    console.log('Sending event data:', formData); // Log the FormData being sent

    try {
        const response = await fetch(`/api/events/create`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            switch (response.status) {
                case 400:
                    throw new Error("Invalid event data provided.");
                case 401:
                    throw new Error("You are not authorized to perform this action. Please log in.");
                case 403:
                    throw new Error("You do not have permission to perform this action.");
                case 500:
                    throw new Error("Internal Server Error. Please try again later.");
                default:
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
            }
        }

        alert("Event created successfully");
        window.location.href = '/events'; // Redirect to the events page
    } catch (error) {
        console.error("Error creating event:", error);
        alert(`Error creating event: ${error.message}`);
    }
    //Do i need to keep it?
    //const createdEvent = await response.json();
};

function cancel() {
    form.reset();
}

