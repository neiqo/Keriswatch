const Event = require("../models/event");

// Controller to get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.getAllEvents();
        res.json(events)
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving events");
    }
}

// Controller to get event by id
const getEventById = async (req, res) => {
    const eventId = parseInt(req.params.id);
    try {
      const event = await Event.getEventById(eventId);
      if (!event) {
        return res.status(404).send("Event not found");
      }
      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving event");
    }
};
  
// Controller to create event
const createEvent = async (req, res) => {
  const newEvent = req.body;
  try {
    const createdEvent = await Event.createEvent(newEvent);
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating Event");
  }
};

// Controller to update event
const updateEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);
  console.log(eventId);
  
  const newEventData = {
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  };

  // If an image is uploaded, include it in newEventData
  if (req.file) {
    newEventData.imagePath = req.file.path; // Assuming imagePath is the field to store the image path
  }

  console.log(newEventData);

  try {
    const updatedEvent = await Event.updateEvent(eventId, newEventData);
    if (!updatedEvent) {
      return res.status(404).send("Event not found");
    }
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating event");
  }
};

// Controller to delete event
const deleteEvent = async (req, res) => {
  const EventId = parseInt(req.params.id);

  try {
    const success = await Event.deleteEvent(EventId);
    if (!success) {
      return res.status(404).send("Event not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting event");
  }
}

//To delete event from eventuser table and event table
const deleteEventandUser = async (req, res) => {
  const EventId = parseInt(req.params.id);

  try {
    const success = await Event.deleteEventandUser(EventId);
    if (!success) {
      return res.status(404).send("Event not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting event");
  }
}


//For pagination
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided

    // Execute the query (using a model or directly with SQL)
    const results = await Event.getEvents(page);// : await pool.request().query(query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving events');
  }
}

// Controller to get events with users
async function getEventswithUsers(req, res) {
  try {
    const events = await Event.getEventswithUsers();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching events with users" });
  }
};

// Controller to get specific event with users
async function getSpecificEventwithUsers(req, res) {
  const eventId = parseInt(req.params.eventId);

  try {
    const event = await Event.getSpecificEventwithUsers(eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching specific event with users" });
  }
};

// Controller to add user to event
async function addUsertoEvent(req, res) {
  // for /events/:eventId/with-users/:userId
  //const eventId = parseInt(req.params.eventId);
  //const userId = parseInt(req.params.userId);

  // for /events/with-users?eventId=3&user_id=2
  const eventId = req.query.eventId;
  const userId = req.query.userId;

  try {
    const event = await Event.addUsertoEvent(eventId, userId);
    res.json(event);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching events with users" });
  }
};

// Controller to delete user from event
async function deleteUserfromEvent(req, res) {
  const eventId = req.query.eventId;
  const userId = req.query.userId;

  try {
    const event = await Event.deleteUserfromEvent(eventId, userId);
    res.json(event);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user from event" });
  }
}

// Controller to get specific event with users
async function getSpecificUserwithEvents(req, res) {
  const userId = parseInt(req.params.userId);

  try {
    const user = await Event.getSpecificEventwithUsers(userId);
    if (!user) {
      return res.status(404).send("Event not found");
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching specific user with events" });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  //deleteEvent,
  deleteEventandUser,
  //deleteUserandEvent,
  getEvents,
  //searchEvents,
  getEventswithUsers,
  getSpecificEventwithUsers,
  addUsertoEvent,
  deleteUserfromEvent,
  getSpecificUserwithEvents
};