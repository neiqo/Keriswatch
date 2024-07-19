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

        // Use Document Fragment for better performance
        const fragment = document.createDocumentFragment();

        currentData.forEach((event) => {
            const eventItem = document.createElement("div");
            eventItem.classList.add("event"); // Add css

            const name = document.createElement("h2");
            name.textContent = event.name;
            const description = document.createElement("h2");
            description.textContent = event.description;
            const type = document.createElement("h2");
            type.textContent = event.type;
            const startdate = document.createElement("h2");
            startdate.textContent = event.startDate;
            const enddate = document.createElement("h2");
            enddate.textContent = event.endDate;

            eventItem.appendChild(name);
            eventItem.appendChild(description);
            eventItem.appendChild(type);
            eventItem.appendChild(startdate);
            eventItem.appendChild(enddate);

            eventItem.addEventListener("click", () => {
                // Handle event click
                // Redirect to event details page or show a modal
                console.log(`Clicked event: ${event.id}`);
                window.location.href = `/events/${event.id}`; // Example URL
            });

            fragment.appendChild(eventItem);
        });

        container.appendChild(fragment);

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
