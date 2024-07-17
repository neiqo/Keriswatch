//let event = document.getElementById("event-information");

let image = document.getElementById("image");
let name = document.getElementById("name");
let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
let description = document.getElementById("description");
let type = document.getElementById("type");

// function getEventIdFromUrl() {
//     const path = window.location.pathname;
//     const pathParts = path.split('/'); // Split the path into parts
//     const eventId = pathParts[pathParts.length - 1]; // Get the last part which should be the eventId
//     return eventId ? parseInt(eventId) : null;
// }

function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    let eventId = urlParams.get('id');
    
    if (!eventId) {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        eventId = pathParts[pathParts.length - 1];
    }
    console.log(eventId);
    return eventId ? parseInt(eventId) : null;
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
    type.textContent = data.type;
}

getEventDetails(getEventIdFromUrl());


// function delete event
let deleteButton = document.getElementById("deleteButton");