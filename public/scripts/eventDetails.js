//let event = document.getElementById("event-information");

let name = document.getElementById("name");
let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
let description = document.getElementById("description");

function getEventIdFromUrl() {
    const path = window.location.pathname;
    const pathParts = path.split('/'); // Split the path into parts
    const eventId = pathParts[pathParts.length - 1]; // Get the last part which should be the eventId
    return eventId ? parseInt(eventId) : null;
}


async function getEventDetails(eventId) {
    const response = await fetch(`/api/events/${eventId}`, {
                method: 'GET'
    });
    const data = await response.json();
    

    name.textContent = data.name;
    startDate.textContent = data.startDate;
    endDate.textContent = data.endDate;
    description.textContent = data.description;
}

getEventDetails(getEventIdFromUrl());