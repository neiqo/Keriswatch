// Initialising libraries
const eventsController = require("./controllers/eventsController");
const validateEvent = require("./middlewares/validateEvent");
const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const staticMiddleware = express.static("public"); // Path to the public folder


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(staticMiddleware); // Mount the static middleware

//for front end
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/events/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'eventDetails.html'));
});


//for backend only
//changed to /api for front end
app.get("/api/events", eventsController.getEvents);
app.get("/api/events/all", eventsController.getAllEvents);
//app.get("/api/events/search", eventsController.searchEvents);
app.get("/api/events/with-users", eventsController.getEventswithUsers);
app.post("/api/events/with-users", eventsController.addUsertoEvent);
app.delete("/api/events/with-users", eventsController.deleteUserfromEvent);


app.get("/api/events/:id", eventsController.getEventById);
app.get("/api/events/with-users/:eventId", eventsController.getSpecificEventwithUsers);
app.post("/api/events", eventsController.createEvent); // POST for creating books (can handle JSON data)
app.put("/api/events/:id", eventsController.updateEvent);
app.delete("/api/events/:id", eventsController.deleteEvent);
app.delete("/api/events/:id/with-users", eventsController.deleteEventandUser);  
//app.delete("/api/events/with-users/:id", eventsController.deleteUserandEvent);

app.listen(PORT, async() => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    }
    catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }

    console.log(`Server is listening on PORT ${PORT}`);
});

process.on("SIGINT", async() => {
    console.log("Server is gracefully shutting down");

    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});
