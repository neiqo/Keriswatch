// Purpose: To create a new event and send it to the server

// Init form
let form = document.getElementById("event-form");


function getValue() {
    let nameValue = form.elements['name'].value;
    let descriptionValue = form.elements['description'].value;
    let typeValue = form.elements['type'].value;
    let startdateValue = form.elements['startdate'].value;
    let enddateValue = form.elements['enddate'].value;

    console.log(nameValue);
    console.log(descriptionValue);
    console.log(typeValue);
    console.log(startdateValue);
    console.log(enddateValue);
    createEvent(nameValue, descriptionValue, typeValue, startdateValue, enddateValue);
}

async function createEvent(name, description, type, startdate, enddate) {
    const data = {
        name: name,
        description: description,
        type: type,
        startDate: startdate,
        endDate: enddate
    }

    const response = await fetch(`/events`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Error creating event: ${response.statusText}`);
    }

    //Do i need to keep it?
    const createdEvent = await response.json();
};

function cancel() {
    name.value = "";
    description.value = "";
    type.value = "";
    startdate = "";
    enddate = "";
}

form.addEventListener("submit", function(event) {
    event.preventDefault(); // This will prevent the form from being submitted in the usual way
    getValue();
});

document.getElementById('CancelButton').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission
    window.history.back();  // Navigate to the previous page
});