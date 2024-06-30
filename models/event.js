const sql = require("mssql");
const dbConfig = require("../dbConfig");
const moment = require('moment');
const upload = require('multer');
const path = require('path');
const fs = require('fs');

class Event {
    constructor(id, name, description, type, startDate, endDate, createddate, modifieddate, imagepath) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createddate = createddate;
        this.modifieddate = modifieddate;
        this.imagepath = imagepath;
    }

    /* Get All Events */
    static async getAllEvents() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Events`;
        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();
        
        return result.recordset.map(
            (row) => new Event(row.id, row.name, 
              row.description, row.type, row.startDate, row.endDate,
          row.createdDate, row.modifiedDate, row.imagePath)
        );
    }

    /* Get Event by ID */
    static async getEventById(id) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM Events WHERE id = @id`; // Parameterized query
    
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset[0]
          ? new Event(
              result.recordset[0].id,
              result.recordset[0].name,
              result.recordset[0].description,
              result.recordset[0].type,
              moment(result.recordset[0].startDate).format('DD-MMM-YYYY'), // Format StartDate
              moment(result.recordset[0].endDate).format('DD-MMM-YYYY'),
              result.recordset[0].createdDate,
              result.recordset[0].modifiedDate,
              result.recordset[0].imagePath
            )
          : null; // Handle book not found
    }

    /* Create Event */
    static async createEvent(newEventData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `INSERT INTO Events (name, description, type, startDate, endDate, createdDate, modifiedDate, imagePath)
     VALUES (@name, @description, @type, @startdate, @enddate, @createddate, @modifieddate, @imagepath); SELECT SCOPE_IDENTITY() AS EventId;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("name", newEventData.name);
        request.input("description", newEventData.description);
        request.input("type", newEventData.type);
        request.input("startdate", newEventData.startDate);
        request.input("enddate", newEventData.endDate);
        request.input("createddate", new Date().toISOString().slice(0, 19));
        request.input("modifieddate", null);
        request.input("imagepath", newEventData.imagePath);

        const result = await request.query(sqlQuery);
        const eventId = result.recordset[0].EventId;

        
        // Check if an image was uploaded
        if (newEventData.imagePath) {
                const newFilePath = path.join("/images/events", `Image_${eventId}${newEventData.name}${path.extname(newEventData.imagePath)}`);
                const oldFilePath = path.join(__dirname, "../public", newEventData.imagePath);
    
                // Rename the file to include the event ID
                fs.renameSync(oldFilePath, path.join(__dirname, "../public", newFilePath));
    
                // Update the event with the new file path
                const updateQuery = `
                    UPDATE Events
                    SET imagePath = @imagepath
                    WHERE id = @eventid`;
                
                const updateRequest = connection.request();
                updateRequest.input("imagepath", newFilePath);
                updateRequest.input("eventid", eventId);
                await updateRequest.query(updateQuery);
            }

        connection.close();
        // Retrieve the newly created book using its ID
        return this.getEventById(result.recordset[0].EventId);
    }

    /* Update Event */
    static async updateEvent(id, newEventData) {
      const connection = await sql.connect(dbConfig);
    
      // Extract fields and values from newEventData
      const fields = Object.entries(newEventData);
      const keys = fields.map(([key, value]) => key); // Extract keys from newEventData
      const values = fields.map(([key, value]) => value); // Extract values from newEventData

      // Update only fields that have values
      const updatedFields = fields
      .filter(([key, value]) => value !== undefined) // Filter out undefined values
      .map(([key, value]) => `${key} = @${key}`);

      const sqlQuery = `UPDATE Events SET ${updatedFields.join(', ')}
                      WHERE id = @id`; // Parameterized query

      const request = connection.request();

      request.input("id", id);
      request.input("name", newEventData.name || null); // Handle optional fields
      request.input("description", newEventData.description || null); // Handle optional fields
      request.input("type", newEventData.type || null); // Handle optional fields
      request.input("startdate", newEventData.startDate || null); // Handle optional fields
      request.input("enddate", newEventData.endDate || null); // Handle optional fields
      request.input("modifieddate", new Date().toISOString().slice(0, 19));
      
      await request.query(sqlQuery);

      connection.close();

      return this.getEventById(id); // returning the updated book data
    }

    static async getEvents(page) {
        const connection = await sql.connect(dbConfig);

        try {
            const perPage = 2; // Events per page

            // Get total number of events
            const pageCount = Math.ceil(Event.totalCount / perPage);

            if (page < 1 || page > pageCount) {
                return res.status(400).send('Invalid page number'); // Handle invalid page requests
            }

            // Calculate the offset
            const offset = (page - 1) * perPage;

            const query = `
            SELECT * FROM events 
            ORDER BY id 
            OFFSET ${offset} ROWS 
            FETCH NEXT ${perPage} ROWS ONLY;
            `;

            
            const result = await connection.request().query(query);
            return result.recordset.map(
                (row) => new Event(row.id, row.name, row.description,
                    row.type, 
                    moment(row.startDate).format('DD-MMM-YYYY'), // Format StartDate
                    moment(row.endDate).format('DD-MMM-YYYY'), // Format End Date
                    row.createdDate, row.modifiedDate, row.imagePath
                )
            );
        } catch (error) {
            throw new Error("Error getting events"); // Or handle error differently
        } finally {
            await connection.close(); // Close connection even on errors
        }
    };

    //Delete Event
    static async deleteEvent(id) {
      const connection = await sql.connect(dbConfig);

      const sqlQuery = `DELETE FROM Events WHERE id = @id;`; // Parameterized query

      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      connection.close();
      return result.rowsAffected > 0;
    }

    //Delete Event and User
    static async deleteEventandUser(id) {
      const connection = await sql.connect(dbConfig);

      const sqlQuery = `DELETE FROM EventUsers WHERE event_id = @id; 
                        DELETE FROM Events WHERE id = @id;`; // Parameterized query

      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      connection.close();
      // Check both elements of rowsAffected array
      const rowsAffected = result.rowsAffected.reduce((a, b) => a + b, 0);
      return rowsAffected > 0;
    }

    //Delete User and Event
    static async deleteUserandEvent(id) {
      const connection = await sql.connect(dbConfig);

      const sqlQuery = `DELETE FROM EventUsers WHERE user_id = @id;
                        DELETE FROM Users WHERE id = @id;`; // Parameterized query

      const request = connection.request();
      request.input("id", id);
      const result = await request.query(sqlQuery);

      connection.close();
      return result.rowsAffected > 0;
    }
    
    //Total number of events
    static async totalCount() {
        const connection = await sql.connect(dbConfig);

        const query = `SELECT COUNT(*) FROM Events`;
        const result = connection.request().query(query);
        return result;
    }

    //Get List of Events with Users
    static async getEventswithUsers() {
      const connection = await sql.connect(dbConfig);

      try {
        const query = `
          SELECT e.id AS event_id, e.name, e.description, e.type, e.startDate, e.endDate, e.imagePath, u.id AS user_id, u.username, u.email
          FROM Events e
          INNER JOIN EventUsers eu ON eu.event_id = e.id
          LEFT JOIN Users u ON eu.user_id = u.id
          ORDER BY e.id;
        `;

        const result = await connection.request().query(query);

        // Group users and their books
        const eventsWithUsers = {};
        for (const row of result.recordset) {
          const eventId = row.event_id;
          if (!eventsWithUsers[eventId]) {
            eventsWithUsers[eventId] = {
              id: eventId,
              name: row.EventName,
              description: row.EventDescription,
              type: row.EventType,
              startdate: row.StartDate,
              enddate: row.EndDate,
              imagepath: row.imagePath,
              users: [],
            };
          }
          eventsWithUsers[eventId].users.push({
            id: row.user_id,
            username: row.username,
            email: row.email,
          });
        }

        return Object.values(eventsWithUsers);
      } catch (error) {
        throw new Error("Error fetching events with users");
      } finally {
        await connection.close();
      }
    } 

    //Get Specific Event with Users
    static async getSpecificEventwithUsers(eventId) {
        const connection = await sql.connect(dbConfig);

        try {
          const query = `
            SELECT e.id AS event_id, e.name, e.description, e.type, e.startDate, e.endDate, e.imagePath, u.id AS user_id, u.username, u.email
            FROM Events e
            INNER JOIN EventUsers eu ON eu.event_id = e.id
            LEFT JOIN Users u ON eu.user_id = u.id
            WHERE e.id = @eventId;
          `;
    
          const request = await connection.request();
          request.input("eventId", eventId);
          const result = await request.query(query);
    
          connection.close();
          // Group users and their books
          //console.log(result.recordset);

          // Modify this so that it doesnt loop but instead only show 1
          const eventsWithUsers = {};
          for (const row of result.recordset) {
            const eventId = row.event_id;
            if (!eventsWithUsers[eventId]) {
              eventsWithUsers[eventId] = {
                id: eventId,
                name: row.EventName,
                description: row.EventDescription,
                type: row.EventType,
                startdate: row.StartDate,
                enddate: row.EndDate,
                imagepath: row.imagePath,
                users: [],
              };
            }
            eventsWithUsers[eventId].users.push({
              id: row.user_id,
              username: row.username,
              email: row.email,
            });
          }
    
          return Object.values(eventsWithUsers);
        } catch (error) {
          throw new Error("Error fetching specific event with users");
        } finally {
          await connection.close();
        }
    }

    //Adding user to an event and then displaying it using other functions
    static async addUsertoEvent(eventId, userId) {
        const connection = await sql.connect(dbConfig);

        try {
            //Add user if user doesnt exist in the event
            const query = `
            BEGIN
              IF NOT EXISTS (SELECT * FROM EventUsers 
                              WHERE event_id = @eventId
                              AND user_id = @userId)
              BEGIN
                  INSERT INTO EventUsers (event_id, user_id)
                  VALUES (@eventId, @userId)
              END
            END;
            SELECT SCOPE_IDENTITY() AS id;`    ;
      
            const request = await connection.request();
            request.input("eventId", eventId);
            request.input("userId", userId);
            const result = await request.query(query);

            //Id in the database when it is entered
            //console.log(result.recordset[0]);
            connection.close();
      
            return this.getSpecificEventwithUsers(eventId);
        } catch (error) {
            throw new Error("Error fetching events with users");
        } finally {
            await connection.close();
        }
    }   

    //Deleting user from an event and then displaying it using other functions
    static async deleteUserfromEvent(eventId, userId) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `DELETE FROM EventUsers WHERE event_id = @eventId
                        AND user_id = @userId`; // Parameterized query
    
        const request = connection.request();
        request.input("eventId", eventId);
        request.input("userId", userId);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return this.getSpecificEventwithUsers(eventId);
    }
}

module.exports = Event;

