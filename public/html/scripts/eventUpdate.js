// // Purpose: To create a new event and send it to the server


// const { func } = require("joi");


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
    const deleteButton = document.getElementById('DeleteButton');
    const form = document.getElementById('event-form');

    // Get event details when the page loads
    const eventId = getEventIdFromUrl();
    if (eventId) {
        getEventDetails(eventId);
    }

    // Add event listeners
    form.addEventListener('submit', handleUpdateClick);
    cancelButton.addEventListener('click', handleCancelClick);
    deleteButton.addEventListener('click', handleDeleteClick);

    // Fetch event ID from URL
    function getEventIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        let eventId = urlParams.get('id');

        if (!eventId) {
            const path = window.location.pathname;
            const pathParts = path.split('/');
            // The event ID is the second to last part in this URL structure
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
            const response = await fetch(`/api/event/${eventId}`, { method: 'GET' });
            if (!response.ok) {
                throw new Error('Error fetching event details');
            }
            const data = await response.json();
            const category = await getEventCategory(data.categoryId);
            // const location = await getEventLocation(data.locationId);
            populateForm(data, category, location);
        } catch (error) {
            console.error(error);
        }
    }

    // Populate form with event details
    function populateForm(data, category, location) {
        //data
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

        // document.getElementById('type').value = data.type;


        const imageContainer = document.getElementById('imageContainer');
        const imagePreview = document.getElementById('imagePreview');

        if (data.imagepath) {
            imagePreview.src = data.imagepath;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
    
        document.getElementById('image').textContent = data.imagepath;
    

        //category
        document.getElementById('category').value = category.id;

        //location
        document.getElementById('locationName').value = data.locationName;
        document.getElementById('address').value = data.address;    
        document.getElementById('postalCode').value = data.postalCode;
        console.log("country", location.country);   
        document.getElementById('country').value = data.country;
        document.getElementById('totalCapacity').value = data.totalCapacity;
        // Handle image display if needed
    }

    function getValue() {
        let nameValue = form.elements['name'].value;
        let descriptionValue = form.elements['description'].value;
        // let typeValue = form.elements['type'].value;
        let startdateValue = form.elements['startdate'].value;
        let enddateValue = form.elements['enddate'].value;
        let imagefile = form.elements['image'].files[0];
    
        //category
        let categoryValue = form.elements['category'].value;

        //location
        let locationNameValue = form.elements['locationName'].value;
        let addressValue = form.elements['address'].value;
        let postalCodeValue = form.elements['postalCode'].value;
        let countryValue = form.elements['country'].value;
        
        let totalCapacityValue = form.elements['totalCapacity'].value;

        console.log(startdateValue);
        // Validate startdate and enddate
        if (!validateDates(startdateValue, enddateValue)) {
            console.error("Start date must be before end date and dates must be valid.");
            return; // Exit the function if validation fails
        }
    
        console.log(nameValue);
        console.log(descriptionValue);
        // console.log(typeValue);
        console.log(startdateValue);
        console.log(enddateValue);
        console.log(imagefile);
        updateEvent(nameValue, descriptionValue, categoryValue, startdateValue, enddateValue, imagefile, locationNameValue, addressValue, postalCodeValue, countryValue, totalCapacityValue);
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
    
    async function updateEvent(name, description, category, startdate, enddate, imagefile, locationName, address, postalCode, country, totalCapacity) {
        const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("categoryId", category);
    formData.append("startDate", startdate);
    formData.append("endDate", enddate);
    formData.append("locationName", locationName);
    formData.append("address", address);
    formData.append("postalCode", postalCode);
    formData.append("country", country);
    formData.append("totalCapacity", totalCapacity);

    if (imagefile) {
        formData.append("image", imagefile); // Assuming imageFile is the File object
    }

    console.log('Sending event data:', formData); // Log the FormData being sent
    let count = 0;
    for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
        count++;
    }
    console.log('Total entries in formData:', count);

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
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
                case 404:
                    throw new Error("Event not found.");
                case 500:
                    throw new Error("Internal Server Error. Please try again later.");
                default:
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
            }
        }

        alert("Event updated successfully");
        window.location.href = `/events/${eventId}`; // Redirect to the updated event page
    } catch (error) {
        console.error("Error updating event:", error);
        alert(`Error updating event: ${error.message}`);
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
    }

    async function deleteEvent() {
        const eventId = getEventIdFromUrl();
        if (!eventId) {
            console.error('Invalid event ID');
            return;
        }
    
        try {
            const response = await fetch(`/api/events/${eventId}/with-users`, {
                method: 'DELETE',
                headers: {
                    
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Error deleting event');
            }
            window.location.href = '/events'; // Redirect to events page
        } catch (error) {
            console.error(error);
        }
    }

    // Handle cancel button click
    function handleCancelClick() {
        form.reset();
        window.history.back();
    }

    function handleDeleteClick() {
        // Handle delete event
        deleteEvent();
        console.log('Delete button clicked');
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

async function getEventCategory(categoryId) {
    try {
        const response = await fetch(`/api/events/category/${categoryId}`, { method: 'GET' });
        const data = await response.json();
        return data;
    }   
    catch (error) {
        console.error(error);
    }
}

// async function getEventLocation(locationId) {
//     try {
//         const response = await fetch(`/api/events/location/${locationId}`, { method: 'GET' });
//         const data = await response.json();
//         return data;
//     }
//     catch (error) {
//         console.error(error);
//     }
// }

