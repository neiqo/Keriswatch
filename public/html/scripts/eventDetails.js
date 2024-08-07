
// const { join } = require("path");


let image = document.getElementById("image");
let name = document.getElementById("name");
let eventDate = document.getElementById("eventDate");
let description = document.getElementById("description");
let category = document.getElementById("category");
let eventLocation = document.getElementById("location");
let totalCapacity = document.getElementById("totalCapacity");
let noOfUsersJoined = document.getElementById("noOfUsersJoined");

// function getEventIdFromUrl() {
//     const path = window.location.pathname;
//     const pathParts = path.split('/'); // Split the path into parts
//     const eventId = pathParts[pathParts.length - 1]; // Get the last part which should be the eventId
//     return eventId ? parseInt(eventId) : null;
// }
const eventId = getEventIdFromUrl();
const userId = getUserIdFromUrl();
let startDateValue;
let endDateValue;
//const numberOfUsersJoined = getNumberofUsersJoined(eventId);
let totalCapacityValue = 0;

console.log("eventid", eventId);
// console.log("numberofusersjoined", numberOfUsersJoined);
console.log("totalcapacityvalue", totalCapacityValue);

function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let eventId = urlParams.get('id');
    
    if (!eventId) {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        eventId = pathParts[pathParts.length - 1];
    }
    return eventId ? parseInt(eventId) : null;
}

function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('userId');
    if (!userId) {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        userId = pathParts[pathParts.length - 1];
    }
    console.log(userId);
    return userId ? parseInt(userId) : null;
}

async function getEventDetails(eventId) {
    const response = await fetch(`/api/event/${eventId}`, {
                method: 'GET'
    });
    const data = await response.json();
    
    // console.log(data);
    image.src = data.imagepath;
    console.log("imagepath", + data.imagepath);
    name.textContent = data.name;

    const startDateObj = new Date(data.startDate);
    const endDateObj = new Date(data.endDate);

    startDateValue = startDateObj;
    endDateValue = endDateObj;
    
    let dateDisplayText = '';

     // Check if startDate and endDate are the same
    if (startDateObj.toDateString() === endDateObj.toDateString()) {
        dateDisplayText = `${startDateObj.getDate()} ${startDateObj.toLocaleDateString('en-US', { month: 'short' })} ${startDateObj.getFullYear()}`;
    } else {
        // Check if both dates are in the same year and month
        if (startDateObj.getFullYear() === endDateObj.getFullYear()) {
            if (startDateObj.getMonth() === endDateObj.getMonth()) {
                // Same month and year
                dateDisplayText = `${startDateObj.getDate()} - ${endDateObj.getDate()} ${startDateObj.toLocaleDateString('en-US', { month: 'short' })} ${startDateObj.getFullYear()}`;
            } else {
                // Different month, same year
                dateDisplayText = `${startDateObj.getDate()} ${startDateObj.toLocaleDateString('en-US', { month: 'short' })} - ${endDateObj.getDate()} ${endDateObj.toLocaleDateString('en-US', { month: 'short' })} ${startDateObj.getFullYear()}`;
            }
        } else {
            // Different year
            dateDisplayText = `${formatDate(startDateObj)} - ${formatDate(endDateObj)}`;
        }
    }

    eventDate.textContent = dateDisplayText;

    // startDate.textContent = data.startDate;
    // endDate.textContent = data.endDate;
    description.textContent = data.description;
    category.textContent = data.categoryName;
    eventLocation.textContent = data.locationName + ", " + data.address + ", " + data.postalCode + ", " + data.country;
    totalCapacity.textContent = data.totalCapacity;

    totalCapacityValue = data.totalCapacity;
    // type.textContent = data.type;

    getEventCategory(data.categoryId);
    getNumberofUsersJoined(eventId);
    getRelatedEvent(data.id, data.categoryId);
}

// Function to format date
function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

getEventDetails(eventId);
checkIfUserJoinedEvent(eventId, userId);

async function checkIfUserJoinedEvent(eventId, userId) {
    try {
        const response = await fetch(`/api/events/${eventId}/joined`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            switch (response.status) {
                case 401:
                    alert("You are not logged in. Please log in to join the event.");
                    break;
                    // alert("You are not authorized to perform this action. Please log in.");
                    //window.location.href = '/login'; // Redirect to login page
                case 403:
                    alert("You do not have permission to check this event.");
                    break;
                case 404:
                    alert("Event not found.");
                    break;
                default:
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
            }
        } else {
            const data = await response.json();

            console.log(data);
            console.log(eventId);

            // Remove existing event listeners
            const newButton = joinButton.cloneNode(true);
            joinButton.parentNode.replaceChild(newButton, joinButton);
            joinButton = newButton;

            if (data === true) {
                joinButton.textContent = "Joined";
                // Optionally, add a class to style the button differently
                joinButton.classList.add("joined");
                joinButton.addEventListener("click", () => {
                    deleteUserFromEvent(eventId, userId);
                });
            } else {
                joinButton.textContent = "Join Now";
                joinButton.classList.remove("joined");
                joinButton.addEventListener("click", () => {
                    addUsertoEvent(eventId, userId);
                });
            }
        }
    } catch (error) {
        console.error("Error checking if user joined event:", error);
        alert(`Error checking if user joined event: ${error.message}`);
    }

}

// function delete event
let deleteButton = document.getElementById("deleteButton");
let joinButton = document.getElementById("joinButton");

// joinButton.addEventListener("click", () => {
//     joinEvent(getEventIdFromUrl());
// });

async function addUsertoEvent(eventId, userId) {
    try {
        const numberOfUsersJoined = await getNumberofUsersJoined(eventId);

        if (totalCapacityValue <= numberOfUsersJoined) {
            alert("Event is full");
            return;
        }

        const currentDate = new Date();

        if (currentDate >= endDateValue) {
            alert("Event has already ended");
            return;
        } else if (currentDate >= startDateValue) {
            alert("Event has already started");
            return;
        }

        const response = await fetch(`/api/events/${eventId}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            switch (response.status) {
                case 401:
                    alert("You are not authorized to perform this action. Please log in.");
                    window.location.href = '/login'; // Redirect to login page
                    break;
                case 403:
                    alert("Only normal users and organisation have permission to perform this action.");
                    break;
                case 404:
                    alert("Event not found.");
                    break;
                default:
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
            }
        } else {
            const data = await response.json();
            noOfUsersJoined.textContent = numberOfUsersJoined + 1;
            checkIfUserJoinedEvent(eventId, userId); // Update button state after joining the event
        }
    } catch (error) {
        console.error("Error adding user to event:", error);
        alert(`Error adding user to event: ${error.message}`);
    }
    //method1
    //if user is added to event, change button text to joined
    // joinButton.textContent = "Joined";

    // //method2
    // console.log(data);
    // checkIfUserJoinedEvent(eventId, userId);
}

async function deleteUserFromEvent(eventId, userId) {
    try {
        const currentDate = new Date();
        if (currentDate >= startDateValue) {
            alert("Event has already started.");
            return;
        } else if (currentDate >= endDateValue) {
            alert("Event is ongoing.");
            return;
        }

        const response = await fetch(`/api/events/${eventId}/users`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            switch (response.status) {
                case 401:
                    alert("You are not authorized to perform this action. Please log in.");
                    window.location.href = '/login'; // Redirect to login page
                    break;
                case 403:
                    alert("Only normal users and organisation have permission to perform this action.");
                    break;
                case 404:
                    alert("Event not found.");
                    break;
                default:
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
            }
        } else {
            const data = await response.json();
            const numberOfUsersJoined = await getNumberofUsersJoined(eventId);
            noOfUsersJoined.textContent = numberOfUsersJoined; // Update the number of users joined
            checkIfUserJoinedEvent(eventId, userId); // Update button state after leaving the event
        }
    } catch (error) {
        console.error("Error removing user from event:", error);
        alert(`Error removing user from event: ${error.message}`);
    }
    //method1
    //if user is added to event, change button text to joined
    // joinButton.textContent = "Joined";

    // //method2
    // console.log(data);
    // checkIfUserJoinedEvent(eventId, userId);
}

async function getEventCategory(categoryId) {
    try {
        const response = await fetch(`/api/events/category/${categoryId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        console.log(data);
        
        const category = document.getElementById("category");
        category.textContent = data.name;
    } catch (error) {
        console.error("Error getting event category:", error);
    }
}


async function getNumberofUsersJoined(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}/users`, {
            method: 'GET'
        });
        const data = await response.json();
        
        noOfUsersJoined.textContent = data;
        return data;
        
        // const users = document.getElementById("users");
        // users.textContent = data;
    } catch (error) {
        console.error("Error getting number of users joined:", error);
        return 0;
    }
}

async function getRelatedEvent(eventId, categoryId) {
    try {
        const response = await fetch(`/api/events/${eventId}/related/category/${categoryId}`, {
            method: 'GET',
        });
        const data = await response.json();
        console.log(data);
        
        const relatedEvents = document.getElementById("related-events");
        // relatedEvents.textContent = data;

        data.forEach(event => {
            let relatedEventId = event.id;
            
            const relatedEvent = document.createElement("div");
            relatedEvent.classList.add("related-event-item");

            let date = document.createElement("p");
            let startDateValue = new Date(event.startDate);
            startDateValue = startDateValue.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

            // Remove the comma from the formatted date string
            startDateValue = startDateValue.replace(',', '');
            date.textContent = startDateValue;

            let name = document.createElement("p");
            name.textContent = event.name;

            let location = document.createElement("p");
            location.textContent = event.locationName + ", " + event.country;

            relatedEvent.appendChild(date);
            relatedEvent.appendChild(name);
            relatedEvent.appendChild(location);

            relatedEvent.addEventListener("click", () => {
                window.location.href = `/events/${relatedEventId}`;
            });
            relatedEvents.appendChild(relatedEvent);
        });
        
    } catch (error) {
        console.error("Error getting related events:", error);
    }
}

deleteButton.addEventListener("click", () => {
    deleteEvent(eventId);
});

async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}/with-users`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized access
                alert("You are not authorized to perform this action. Please log in.");
                //window.location.href = '/login'; // Redirect to login page
            } else if (response.status === 403) {
                // Forbidden access
                alert("You do not have permission to perform this action.");
            } else {
                // Other errors
                const errorMessage = await response.text(); // Or response.json() if the error response is in JSON format
                throw new Error(errorMessage);
            }
        } else {
            alert("Event deleted successfully");
            window.location.href = '/events';
        }
    }
    catch (error) {
        console.error("Error deleting event:", error);
    }
}

const updateButton = document.getElementById("updateButton");
updateButton.addEventListener("click", () => {
    window.location.href = `/events/${eventId}/update`;
});
