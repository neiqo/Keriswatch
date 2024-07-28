let container = document.getElementById("events-joined");


function getEventIdFromUrl() {
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

function getEventsJoined(userId) {
    fetch(`/api/events/with-users/${userId}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const events = data[0].events;
        events.forEach(event => {
            let eventCard = document.createElement("div");
            eventCard.classList.add("event-card");
            
            let image = document.createElement("img");
            console.log(event.imagePath);
            image.src = event.imagePath;
            image.classList.add("event-image");
            
            let name = document.createElement("h3");
            name.textContent = event.name;
            
            const eventStartDate = new Date(event.startDate);
            const eventEndDate = new Date(event.endDate);

            const formattedStartDate = eventStartDate.toISOString().split('T')[0];
            const formattedEndDate = eventEndDate.toISOString().split('T')[0];
            
            let startDate = document.createElement("p");
            startDate.textContent = `Start Date: ${formattedStartDate}`;
            
            let endDate = document.createElement("p");
            endDate.textContent = `End Date: ${formattedEndDate}`;
            
            // let description = document.createElement("p");
            // description.textContent = event.description;
            
            let type = document.createElement("p");
            type.textContent = `Type: ${event.type}`;
            
            // let deleteButton = document.createElement("button");
            // deleteButton.textContent = "Delete";
            // deleteButton.addEventListener("click", () => {
            //     deleteEvent(event.id);
            // });
            
            eventCard.appendChild(image);
            eventCard.appendChild(name);
            eventCard.appendChild(startDate);
            eventCard.appendChild(endDate);
            // eventCard.appendChild(description);
            eventCard.appendChild(type);
            // eventCard.appendChild(deleteButton);
            eventCard.addEventListener("click", () => {
                window.location.href = `/events/${event.id}`;
            });
            
            container.appendChild(eventCard);
            
        });
    });
}

getEventsJoined(getEventIdFromUrl());

