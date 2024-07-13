// // Purpose: To create a new event and send it to the server


// // Example starter JavaScript for disabling form submissions if there are invalid fields
// (function() {
//     'use strict';

//     window.addEventListener('load', function() {
//         // Fetch all the forms we want to apply custom Bootstrap validation styles to
//         var forms = document.getElementsByClassName('needs-validation');

//         // Loop over them and prevent submission
//         var validation = Array.prototype.filter.call(forms, function(form) {
//             form.addEventListener('submit', function(event) {
//                 if (form.checkValidity() === false) {
//                     event.preventDefault();
//                     event.stopPropagation();
//                 } 
//                 else {
//                     event.preventDefault(); // Prevent default form submission
//                     handleCreateClick(event); // Call custom form submission handler
//                 }
//                 form.classList.add('was-validated');
//             }, false);
//         });
//     }, false);
// })();

// // Access the buttons
// const updateButton = document.querySelector('.btn-primary[type="submit"]');
// const cancelButton = document.getElementById('CancelButton');

// // Define the function for the Create button
// function handleUpdateClick(event) {
//     event.preventDefault(); // Prevent form submission if necessary
//     // Logic to handle creation
    
//     getValue();
//     console.log('Create button clicked');
//     // Example: Collect form data and send it to a server
// }

// // Define the function for the Cancel button
// function handleCancelClick() {
//     // Logic to handle cancellation
//     console.log('Cancel button clicked');
//     cancel();
//     window.history.back();  // Navigate to the previous page
//     // Example: Clear the form or redirect
// }

// // Init form
// let form = document.getElementById("event-form");


// function getValue() {
//     let nameValue = form.elements['name'].value;
//     let descriptionValue = form.elements['description'].value;
//     let typeValue = form.elements['type'].value;
//     let startdateValue = form.elements['startdate'].value;
//     let enddateValue = form.elements['enddate'].value;

//     let imagefile = form.elements['image'].files[0];

//     // Validate startdate and enddate
//     if (!validateDates(startdateValue, enddateValue)) {
//         console.error("Start date must be before end date and dates must be valid.");
//         return; // Exit the function if validation fails
//     }

//     console.log(nameValue);
//     console.log(descriptionValue);
//     console.log(typeValue);
//     console.log(startdateValue);
//     console.log(enddateValue);
//     console.log(imagefile);
//     createEvent(nameValue, descriptionValue, typeValue, startdateValue, enddateValue, imagefile);
// }


// function validateDates(startdate, enddate) {
//     let startDate = new Date(startdate);
//     let endDate = new Date(enddate);
//     let today = new Date();
    
//     // Remove time part from today's date
//     today.setHours(0, 0, 0, 0);

//     // Check if start date is before today
//     if (startDate < today) {
//         alert("Start date cannot be earlier than today.");
//         return false; // Start date is earlier than today
//     }

//     // Check if start date is before end date
//     if (startDate > endDate) {
//         alert("Start date must be before end date.");
//         return false; // Invalid dates
//     }
//     return true; // Valid dates
// }

// async function updateEvent(name, description, type, startdate, enddate, imagefile) {
//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("description", description);
//     formData.append("type", type);
//     formData.append("startDate", startdate);
//     formData.append("endDate", enddate);
//     formData.append("image", imagefile); // Assuming imageFile is the File object

//     console.log('Sending event data:', formData); // Log the FormData being sent

//     const response = await fetch(`/api/events`, {
//         method: 'PUT',
//         body: formData
//     });
    
//     if (!response.ok) {
//         throw new Error(`Error updating event: ${response.statusText}`);
//     }

//     //Do i need to keep it?
//     //const createdEvent = await response.json();
// };

// function cancel() {
//     form.reset();
// }


//get

// let image = document.getElementById("image");
// let name = document.getElementById("name");
// let startDate = document.getElementById("startdate");
// let endDate = document.getElementById("enddate");
// let description = document.getElementById("description");
// let type = document.getElementById("type");

// function getEventIdFromUrl() {
//     const urlParams = new URLSearchParams(window.location.search);
//     let eventId = urlParams.get('id');
    
//     if (!eventId) {
//         const path = window.location.pathname;
//         const pathParts = path.split('/');
//         if (pathParts.length > 2 && !isNaN(pathParts[pathParts.length - 2])) {
//             eventId = pathParts[pathParts.length - 2];
//         }
//     }
//     console.log(eventId);
//     return eventId ? parseInt(eventId) : null;
// }



// async function getEventDetails(eventId) {
//     const response = await fetch(`/api/events/${eventId}`, {
//                 method: 'GET'
//     });
//     const data = await response.json();
    
//     console.log(data);
//     image.src = data.imagepath;
//     console.log(data.imagepath);
//     name.textContent = data.name;
//     startDate.textContent = data.startDate;
//     endDate.textContent = data.endDate;
//     description.textContent = data.description;
//     type.textContent = data.type;
// }

// getEventDetails(getEventIdFromUrl());


// function delete event
// let deleteButton = document.getElementById("deleteButton");

document.addEventListener('DOMContentLoaded', function() {
    // const updateButton = document.getElementById('SubmitButton');
    const cancelButton = document.getElementById('CancelButton');
    const form = document.getElementById('event-form');

    // Get event details when the page loads
    const eventId = getEventIdFromUrl();
    if (eventId) {
        getEventDetails(eventId);
    }

    // Add event listeners
    form.addEventListener('submit', handleUpdateClick);
    cancelButton.addEventListener('click', handleCancelClick);

    // Fetch event ID from URL
    function getEventIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        let eventId = urlParams.get('id');
        
        if (!eventId) {
            const path = window.location.pathname;
            const pathParts = path.split('/');
            if (pathParts.length > 2 && !isNaN(pathParts[pathParts.length - 2])) {
                eventId = pathParts[pathParts.length - 2];
            }
        }
        console.log(eventId);
        return eventId ? parseInt(eventId) : null;
    }

    // Fetch event details
    async function getEventDetails(eventId) {
        try {
            const response = await fetch(`/api/events/${eventId}`, { method: 'GET' });
            if (!response.ok) {
                throw new Error('Error fetching event details');
            }
            const data = await response.json();
            populateForm(data);
        } catch (error) {
            console.error(error);
        }
    }

    // Populate form with event details
    function populateForm(data) {
        document.getElementById('name').value = data.name;
        document.getElementById('description').value = data.description;

        console.log(data.startDate);
        // Convert date strings to yyyy-MM-dd format
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        // Format dates to yyyy-MM-dd
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        document.getElementById('startdate').value = formattedStartDate;
        document.getElementById('enddate').value = formattedEndDate;

        document.getElementById('type').value = data.type;


        const imageContainer = document.getElementById('imageContainer');
        const imagePreview = document.getElementById('imagePreview');

        if (data.imagepath) {
            imagePreview.src = data.imagepath;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
    
        document.getElementById('image').textContent = data.imagepath;
    
        // Handle image display if needed
    }

    function getValue() {
        let nameValue = form.elements['name'].value;
        let descriptionValue = form.elements['description'].value;
        let typeValue = form.elements['type'].value;
        let startdateValue = form.elements['startdate'].value;
        let enddateValue = form.elements['enddate'].value;
        let imagefile = form.elements['image'].files[0];
    
        console.log(startdateValue);
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
        updateEvent(nameValue, descriptionValue, typeValue, startdateValue, enddateValue, imagefile);
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
    
    async function updateEvent(name, description, type, startdate, enddate, imagefile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("type", type);
        formData.append("startDate", startdate);
        formData.append("endDate", enddate);
        // formData.append("image", imagefile); // Assuming imageFile is the File object
    
        if (imagefile) {
            formData.append("image", imagefile); // Assuming imageFile is the File object
        }

        console.log('Sending event data:', formData); // Log the FormData being sent
        console.log(formData.get('name'));
        console.log(formData.get('description'));
        console.log(formData.get('type'));
        console.log(formData.get('startDate'));
        console.log(formData.get('endDate'));
        console.log(formData.get('image'));
        let count = 0;
        for (let pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]); 
            count++;
        }
        console.log('Total entries in formData:', count);
        // console.log(formData.get('image'));

        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error updating event: ${response.statusText}`);
        }
    
        //Do i need to keep it?
        //const createdEvent = await response.json();
    };

    // Handle form submission for updating event
    async function handleUpdateClick(event) {
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        getValue();
        // const formData = new FormData(form);
        // try {
        //     const response = await fetch(`/api/events/${eventId}`, {
        //         method: 'PUT',
        //         body: formData
        //     });
        //     if (!response.ok) {
        //         throw new Error('Error updating event');
        //     }
        //     console.log('Event updated successfully');
        //     // Redirect or show success message
        // } catch (error) {
        //     console.error(error);
        // }
    }

    // Handle cancel button click
    function handleCancelClick() {
        form.reset();
        window.history.back();
    }
});

// Function to preview selected image
function previewImage(event) {
    const imagePreview = document.getElementById('imagePreview');
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
}