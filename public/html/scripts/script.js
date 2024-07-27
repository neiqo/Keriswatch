let pageNumber = getPageNumberFromUrl();
let isFetching = false; // Flag to prevent multiple rapid clicks

function getPageNumberFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    return page ? parseInt(page) : 1;
}

async function fetchEvents(pageNumber) {
    try {
        isFetching = true; // Set fetching flag

        // Fetch data in parallel
        const response = fetch(`/api/events?page=${pageNumber}`, { method: 'GET' });
        const nextPage = pageNumber + 1;
        const nextResponse = fetch(`/api/events?page=${nextPage}`, { method: 'GET' });

        const [currentData, nextData] = await Promise.all([response, nextResponse])
            .then(async ([currentRes, nextRes]) => {
                return [await currentRes.json(), await nextRes.json()];
            });

        // Main Event page
        const container = document.getElementById("event-list");
        container.innerHTML = "";

        currentData.forEach((event) => {
            console.log(event);
            const eventItem = document.createElement("div");
            eventItem.classList.add("event");

            const eventInfo = document.createElement("div");
            eventInfo.classList.add("event-info");

            const date = document.createElement("h3");
            date.textContent = `${event.startDate} - ${event.endDate}`;

            const name = document.createElement("h2");
            name.textContent = event.name;

            const location = document.createElement("p");
            location.textContent = event.address + ', ' + event.postalCode + ', ' + event.country || "Location not provided"; // Assuming event object has a location property

            const description = document.createElement("p");
            description.textContent = event.description;

            const interestedButton = document.createElement("button");
            interestedButton.classList.add("interested");
            interestedButton.innerHTML = `Interested`; // Assuming event object has an interestedCount property

            eventInfo.appendChild(name);
            eventInfo.appendChild(date);
            eventInfo.appendChild(location);
            // eventInfo.appendChild(description);
            eventInfo.appendChild(interestedButton);

            const eventImage = document.createElement("div");
            eventImage.classList.add("event-image");

            const img = document.createElement("img");
            img.src = event.imagepath || "https://via.placeholder.com/100"; // Assuming event object has an imageUrl property
            img.alt = "Event Image";

            eventImage.appendChild(img);

            eventItem.appendChild(eventImage);
            eventItem.appendChild(eventInfo);

            eventItem.addEventListener("click", () => {
                // Handle event click
                console.log(`Clicked event: ${event.id}`);
                window.location.href = `/events/${event.id}`; // Example URL
            });

            container.appendChild(eventItem);
        });

        // Update UI for pagination
        updateButton(nextData.length);
    } catch (error) {
        console.error("Failed to fetch events:", error);
    } finally {
        isFetching = false; // Reset fetching flag
    }
}


//Handle pagination clicks 


// is this efficient in change button ui?
// if click too fast will exceed

function updateButton(dataLength) {
    if (pageNumber === 1) {
        prevButton.parentElement.classList.add("disabled");
    }
    else {
        prevButton.parentElement.classList.remove("disabled");
    }

    if (dataLength === 0) {
        nextButton.parentElement.classList.add("disabled");
    }
    else {
        nextButton.parentElement.classList.remove("disabled");
    }
}

const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");

prevButton.addEventListener("click", () => {
  // Handle previous page click
  //let currentPage = 1; // Assuming initial page is 1
  if (isFetching || pageNumber === 1) return;
  pageNumber--; // Decrement page number for previous

  updateUrl(pageNumber);

  // Ensure page number is within valid range
  pageNumber = Math.max(1, pageNumber); // Clamp to minimum (page 1)

  fetchEvents(pageNumber); // Fetch events for the updated page
});

nextButton.addEventListener("click", () => {
  // Handle next page click
  //let currentPage = 1; // Assuming initial page is 1
  pageNumber++; // Increment page number for next
    updateUrl(pageNumber); 
  fetchEvents(pageNumber); // Fetch events for the updated page
});

function updateUrl(pageNumber) {
    const url = new URL(window.location);
    url.pathname = '/events';
    url.searchParams.set('page', pageNumber);
    window.history.pushState({ path: url.href }, '', url.href);
}

// Initialize with the first page
fetchEvents(pageNumber);
