
// const { join } = require("path");

let image = document.getElementById("image");
let name = document.getElementById("name");
let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
let description = document.getElementById("description");
let category = document.getElementById("category");
let eventLocation = document.getElementById("location");
let totalCapacity = document.getElementById("totalCapacity");

// function getEventIdFromUrl() {
//     const path = window.location.pathname;
//     const pathParts = path.split('/'); // Split the path into parts
//     const eventId = pathParts[pathParts.length - 1]; // Get the last part which should be the eventId
//     return eventId ? parseInt(eventId) : null;
// }
const eventId = getEventIdFromUrl();
const userId = getUserIdFromUrl();
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
        eventId = pathParts[pathParts.length - 3];
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
    const response = await fetch(`/api/events/${eventId}`, {
                method: 'GET'
    });
    const data = await response.json();
    
    console.log(data);
    image.src = data.imagepath;
    console.log(data.imagepath);
    name.textContent = data.name;
    startDate.textContent = data.startDate;
    endDate.textContent = data.endDate;
    description.textContent = data.description;
    category.textContent = data.categoryName;
    location.textContent = data.locationName + ", " + data.address + ", " + data.postalCode + ", " + data.country;
    totalCapacity.textContent = data.totalCapacity;

    totalCapacityValue = data.totalCapacity;
    // type.textContent = data.type;

    getEventCategory(data.categoryId);
}

getEventDetails(eventId);
checkIfUserJoinedEvent(eventId, userId);

async function checkIfUserJoinedEvent(eventId, userId) {
    try {
        const response = await fetch(`/api/events/${eventId}/user/${userId}/joined`, { method: 'GET' });
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

        

    } catch (error) {
        console.error("Error checking if user joined event:", error);
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
        // const response = await fetch(`/api/events/${eventId}/join`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ userId })
        // });
        const numberOfUsersJoined = await getNumberofUsersJoined(eventId);
        
        if (totalCapacityValue <= numberOfUsersJoined) {
            console.log("totalCapacityValue", totalCapacityValue);
            console.log("numberOfUsersJoined", numberOfUsersJoined);
            alert("Event is full");
            return;
        }

        // if (new Date() >= new Date(endDate.textContent)) {
        //     alert("Event has already ended");
        //     return;
        // }
        // else if (new Date() >= new Date(startDate.textContent)) {
        //     alert("Event has already started");
        //     return;
        // }

        //betterversion
        const startDateValue = new Date(startDate.textContent);
        const endDateValue = new Date(endDate.textContent);
        const currentDate = new Date();

        if (currentDate >= endDateValue) {
            alert("Event has already ended");
            return;
        } else if (currentDate >= startDateValue) {
            alert("Event has already started");
            return;
        }

        const response = await fetch(`/api/events/${eventId}/user/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        // console.log(data);
        // Update button state after joining the event
        checkIfUserJoinedEvent(eventId, userId);
    } catch (error) {
        console.error("Error adding user to event:", error);
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
        // const response = await fetch(`/api/events/${eventId}/join`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ userId })
        // });
    
        if (new Date() >= new Date(endDate.textContent)) {
            alert("Event has already ended");
            return;
        }
        else if (new Date() >= new Date(startDate.textContent)) {
            alert("Event is ongoing");
            return;
        }
        
        const response = await fetch(`/api/events/${eventId}/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        // console.log(data);
        // Update button state after joining the event
        checkIfUserJoinedEvent(eventId, userId);
    } catch (error) {
        console.error("Error adding user to event:", error);
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
            method: 'GET'
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
        return data;
        
        // const users = document.getElementById("users");
        // users.textContent = data;
    } catch (error) {
        console.error("Error getting number of users joined:", error);
        return 0;
    }
}