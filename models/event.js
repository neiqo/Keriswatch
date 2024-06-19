const sql = require("mssql");
const dbConfig = require("../dbConfig");
const moment = require('moment');

class Event {
    constructor(id, name, description, type, startDate, endDate, createddate, modifieddate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createddate = createddate;
        this.modifieddate = modifieddate;
    }

    static async getAllEvents() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Events`;
        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();
        
        return result.recordset.map(
            (row) => new Event(row.EventId, row.EventName, 
                row.EventDescription, row.EventType, row.StartDate, row.EndDate,
            row.CreatedDate, row.ModifiedDate)
        );
    }

    static async getEventById(id) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM Events WHERE EventId = @id`; // Parameterized query
    
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset[0]
          ? new Event(
              result.recordset[0].EventId,
              result.recordset[0].EventName,
              result.recordset[0].EventDescription,
              result.recordset[0].EventType,
              moment(result.recordset[0].StartDate).format('DD-MMM-YYYY'), // Format StartDate
              moment(result.recordset[0].EndDate).format('DD-MMM-YYYY'),
              result.recordset[0].CreatedDate,
              result.recordset[0].ModifiedDate
            )
          : null; // Handle book not found
    }

    static async createEvent(newEventData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `INSERT INTO Events (EventName, EventDescription, EventType, StartDate, EndDate, CreatedDate, ModifiedDate)
         VALUES (@name, @description, @type, @startdate, @enddate, @createddate, @modifieddate); SELECT SCOPE_IDENTITY() AS EventId;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("name", newEventData.name);
        request.input("description", newEventData.description);
        request.input("type", newEventData.type);
        request.input("startdate", newEventData.startDate);
        request.input("enddate", newEventData.endDate);
        request.input("createddate", new Date().toISOString().slice(0, 19));
        request.input("modifieddate", null);

        const result = await request.query(sqlQuery);
    
        connection.close();
    
        // Retrieve the newly created book using its ID
        return this.getEventById(result.recordset[0].EventId);
    }

    static async updateEvent(id, newEventData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `UPDATE Events SET EventName = @name, 
                        EventDescription = @description,
                        EventType = @type,
                        StartDate = @startdate,
                        EndDate = @enddate,
                        ModifiedDate = @modifieddate
                        WHERE EventId = @id`; // Parameterized query
    
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
            const perPage = 2; // Adjust perPage value as needed

            // Calculate total number of events (assuming you have a `count` function)
            //const totalCount = await Event.countEvents(); // Replace with your model's count logic (or direct SQL query)
            //const pageCount = Math.ceil(totalCount / perPage);

            const pageCount = Math.ceil(Event.totalCount / perPage);

            if (page < 1 || page > pageCount) {
                return res.status(400).send('Invalid page number'); // Handle invalid page requests
            }

            const offset = (page - 1) * perPage;

            const query = `
            SELECT * FROM events 
            ORDER BY EventId 
            OFFSET ${offset} ROWS 
            FETCH NEXT ${perPage} ROWS ONLY;
            `;

            
            const result = await connection.request().query(query);
            return result.recordset.map(
                (row) => new Event(row.EventId, row.EventName, row.EventDescription,
                    row.EventType, 
                    moment(row.StartDate).format('DD-MMM-YYYY'), // Format StartDate
                    moment(row.EndDate).format('DD-MMM-YYYY'), // Format End Date
                    row.CreatedDate, row.ModifiedDate
                )
            );
        } catch (error) {
            throw new Error("Error getting events"); // Or handle error differently
        } finally {
            await connection.close(); // Close connection even on errors
        }
    };

    static async deleteEvent(id) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `DELETE FROM Events WHERE EventId = @id`; // Parameterized query
    
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.rowsAffected > 0; 
    }

    static async deleteEventandUser(id) {
      const connection = await sql.connect(dbConfig);

      const sqlQuery = `DELETE FROM EventUsers WHERE event_id = @id; 
                        DELETE FROM Events WHERE EventId = @id;`; // Parameterized query

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

    //get list of users who joined the events
    static async getEventswithUsers() {
      const connection = await sql.connect(dbConfig);

      try {
        const query = `
          SELECT e.EventId AS event_id, e.EventName, e.EventDescription, e.EventType, e.StartDate, e.EndDate, u.id AS user_id, u.username, u.email
          FROM Events e
          LEFT JOIN EventUsers eu ON eu.event_id = e.EventId
          LEFT JOIN Users u ON eu.user_id = u.id
          ORDER BY e.EventId;
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

    static async getSpecificEventwithUsers(eventId) {
        const connection = await sql.connect(dbConfig);

        try {
          const query = `
            SELECT e.EventId AS event_id, e.EventName, e.EventDescription, e.EventType, e.StartDate, e.EndDate, u.id AS user_id, u.username, u.email
            FROM Events e
            LEFT JOIN EventUsers eu ON eu.event_id = e.EventId
            LEFT JOIN Users u ON eu.user_id = u.id
            WHERE e.EventId = @eventId;
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
            SELECT SCOPE_IDENTITY() AS EventId;`    ;
      
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