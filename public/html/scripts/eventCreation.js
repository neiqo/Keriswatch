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
    let nameValue = form.elements['name'].value;
    let descriptionValue = form.elements['description'].value;
    let typeValue = form.elements['type'].value;
    let startdateValue = form.elements['startdate'].value;
    let enddateValue = form.elements['enddate'].value;

    let imagefile = form.elements['image'].files[0];

    // Validate startdate and enddate
    if (!validateDates(startdateValue, enddateValue)) {
        console.error("Start date must be before end date and dates must be valid.");
        return; // Exit the function if validation fails
    }

    console.log(nameValue);
    console.log(descriptionValue);
    console.log(typeValue);
    console.log(startdateValue);
    console.log(enddateValue);
    console.log(imagefile);
    createEvent(nameValue, descriptionValue, typeValue, startdateValue, enddateValue, imagefile);
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

async function createEvent(name, description, type, startdate, enddate, imagefile) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("startDate", startdate);
    formData.append("endDate", enddate);
    formData.append("image", imagefile); // Assuming imageFile is the File object

    console.log('Sending event data:', formData); // Log the FormData being sent

    const response = await fetch(`/api/events`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`Error creating event: ${response.statusText}`);
    }

    //Do i need to keep it?
    //const createdEvent = await response.json();
};

function cancel() {
    form.reset();
}

