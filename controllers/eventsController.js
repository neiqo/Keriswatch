const { get } = require("https");
const Event = require("../models/event");
const { parse } = require("path");
const jwt = require('jsonwebtoken');


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

  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let token;
  try {
    // Attempt to parse the token as JSON
    // For Web Application
    const parsedJsonToken = JSON.parse(authHeader.split(' ')[1]);
    token = parsedJsonToken.token;
  } catch (error) {
    // If parsing fails, assume the token is a plain string
    // For Swagger 
    token = authHeader.split(' ')[1];
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract user role from the decoded token
    const userRole = decoded.role;

    // Check if the user has permission to create the event
    if (!['Organisation', 'Admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permissions to create this event' });
    }

    console.log("new event", newEvent);

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

  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let token;
  try {
    // Attempt to parse the token as JSON
    // For Web Application
    const parsedJsonToken = JSON.parse(authHeader.split(' ')[1]);
    token = parsedJsonToken.token;
  } catch (error) {
    // If parsing fails, assume the token is a plain string
    // For Swagger 
    token = authHeader.split(' ')[1];
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract user role from the decoded token
    const userRole = decoded.role;

    // Check if the user has permission to update the event
    if (!['Organisation', 'Admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permissions to update this event' });
    }

    console.log(eventId);

    const newEventData = {
      name: req.body.name,
      description: req.body.description,
      categoryId: req.body.categoryId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      locationName: req.body.locationName,
      address: req.body.address,
      postalCode: req.body.postalCode,
      country: req.body.country,
      totalCapacity: req.body.totalCapacity
    };

    // If an image is uploaded, include it in newEventData
    if (req.file) {
      newEventData.imagePath = req.file.path; // Assuming imagePath is the field to store the image path
    }

    console.log(newEventData);

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


//To delete event from eventuser table and event table
const deleteEventandUser = async (req, res) => {
  const EventId = parseInt(req.params.id);
  
  console.log("deleteeventid", EventId);
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let token;
  try {
    // Attempt to parse the token as JSON
    // For Web Application
    const parsedJsonToken = JSON.parse(authHeader.split(' ')[1]);
    token = parsedJsonToken.token;
  } catch (error) {
    // If parsing fails, assume the token is a plain string
    // For Swagger 
    token = authHeader.split(' ')[1];
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract userId and role from the decoded token
    const userId = decoded.userId;
    const userRole = decoded.role;

    // Check if the user has permission to delete the event
    if (!['Organisation', 'Admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permissions to delete this event' });
    }

    // Proceed to delete the event and associated users
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
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching events with users" });
  }
};

// Controller to get specific event with users
async function getSpecificEventwithUsers(req, res) {
  const eventId = parseInt(req.params.eventId);

  console.log("eventId controller", eventId);
  try {
    const event = await Event.getSpecificEventwithUsers(eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    }
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching specific event with users" });
  }
};

// Controller to add user to event
async function addUsertoEvent(req, res) {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;

  console.log("authHeader", authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let token;
  try {
    // Attempt to parse the token as JSON
    // If successful, the token is in the format { "token": "
    // For Web Application
    const parsedJsonToken = JSON.parse(authHeader.split(' ')[1]);
    token = parsedJsonToken.token;
    console.log("Parsed JSON token:", token);
  } catch (error) {
    // If parsing fails, assume the token is a plain string
    // For Swagger 
    token = authHeader.split(' ')[1];
    console.log("Plain token:", token);
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract userId from the decoded token
    const userId = decoded.userId;
    
    // Extract eventId from the request parameters
    const eventId = parseInt(req.params.id);

    console.log("userId", userId);
    console.log("eventId", eventId);

    // Add user to event
    const event = await Event.addUsertoEvent(eventId, userId);
    
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding user to event' });
  }
};

// Controller to delete user from event
async function deleteUserfromEvent(req, res) {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;

  console.log("authHeader", authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let token;
  try {
    // Attempt to parse the token as JSON
    // If successful, the token is in the format { "token": "
    // For Web Application
    const parsedJsonToken = JSON.parse(authHeader.split(' ')[1]);
    token = parsedJsonToken.token;
    console.log("Parsed JSON token:", token);
  } catch (error) {
    // If parsing fails, assume the token is a plain string
    // For Swagger 
    token = authHeader.split(' ')[1];
    console.log("Plain token:", token);
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract userId from the decoded token
    const userId = decoded.userId;
    
    // Extract eventId from the request parameters
    const eventId = parseInt(req.params.id);

    console.log("userId", userId);
    console.log("eventId", eventId);

    // Delete user from event
    const event = await Event.deleteUserfromEvent(eventId, userId);
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user from event" });
  }
}



// Controller to check if user joined event
async function checkIfUserJoinedEvent(req, res) {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let token;
  try {
    // Attempt to parse the token
    const tokenPart = authHeader.split(' ')[1];
    try {
      // Try parsing the token as JSON (for Web Application)
      const parsedJsonToken = JSON.parse(tokenPart);
      token = parsedJsonToken.token;
    } catch (jsonParseError) {
      // If parsing fails, assume the token is a plain string (for Swagger)
      token = tokenPart;
    }
  } catch (error) {
    console.error("Token extraction error:", error);
    return res.status(400).json({ message: 'Invalid token format' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract userId from the decoded token
    const userId = decoded.userId;

    // Extract eventId from the request parameters
    const eventId = parseInt(req.params.id);

    // Check if user joined the event
    const eventJoined = await Event.checkIfUserJoinedEvent(eventId, userId);

    res.status(200).json(eventJoined);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else {
      console.error("Error checking if user joined event:", error);
      res.status(500).json({ message: "Error checking if user joined event" });
    }
  }
}


async function getEventCategory(req, res) {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const category = await Event.getEventCategory(categoryId);
    res.status(200).json(category);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event category" });
  }
}

async function getNumberofUsersJoined(req, res) {
  try {
    const eventId = parseInt(req.params.id);
    const users = await Event.getNumberofUsersJoined(eventId);
    res.status(200).json(users);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching number of users joined" });
  }
}

async function getRelatedEvent(req, res) {
  try {
    const eventId = parseInt(req.params.eventId);
    const categoryId = parseInt(req.params.categoryId);
    const events = await Event.getRelatedEvent(eventId, categoryId);
    res.status(200).json(events);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching related events" });
  }

}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEventandUser,
  //deleteUserandEvent,
  getEvents,
  //searchEvents,
  getEventswithUsers,
  getSpecificEventwithUsers,
  addUsertoEvent,
  deleteUserfromEvent,
  checkIfUserJoinedEvent, 
  getEventCategory, 
  getNumberofUsersJoined, 
  getRelatedEvent
};