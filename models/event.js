const sql = require('mssql');
const dbConfig = require("../dbConfig");
const moment = require('moment');
const upload = require('multer');
const path = require('path');
const fs = require('fs');
const { type } = require('os');

class Event {
  constructor(id, name, description, categoryId, locationId, startDate, endDate, createddate, modifieddate, imagepath) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.categoryId = categoryId;
    this.locationId = locationId;
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
            row.description, row.categoryId, row.locationId, row.startDate, row.endDate,
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
          result.recordset[0].categoryId,
          result.recordset[0].locationId,
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
      const transaction = new sql.Transaction(connection);
  
      try {
          await transaction.begin();
  
          const location = {
              locationName: newEventData.locationName,
              address: newEventData.address,
              postalCode: newEventData.postalCode,
              country: newEventData.country
          }
          // Add the location first
          const locationResult = await Event.addLocation(location, transaction);
          const locationId = locationResult.recordset[0].id; // Assuming you have an identity column in EventLocations
          
          // Now add the event
          const sqlQuery = `INSERT INTO Events (name, description, categoryId, locationId, startDate, endDate, createdDate, modifiedDate, imagePath)
              VALUES (@name, @description, @categoryId, @locationId, @startdate, @enddate, @createddate, @modifieddate, @imagepath); 
              SELECT SCOPE_IDENTITY() AS EventId;`; // Retrieve ID of inserted record
          
          const request = transaction.request();
          request.input("name", newEventData.name);
          request.input("description", newEventData.description);
          request.input("categoryId", 1); // Use the default category ID`");
          request.input("locationId", locationId); //
          request.input("startdate", newEventData.startDate);
          request.input("enddate", newEventData.endDate);
          request.input("createddate", new Date().toISOString().slice(0, 19));
          request.input("modifieddate", null);
          request.input("imagepath", newEventData.imagePath);
  
          const result = await request.query(sqlQuery);
          const eventId = result.recordset[0].EventId;
  
          // Check if an image was uploaded
          if (newEventData.imagePath) {
              const newFilePath = path.join("/html/images/events", `Image_${eventId}${path.extname(newEventData.imagePath)}`);
              const oldFilePath = path.join(__dirname, "../public/html", newEventData.imagePath);
              // Rename the file to include the event ID
              fs.renameSync(oldFilePath, path.join(__dirname, "../public", newFilePath));
      
              // Update the event with the new file path
              const updateQuery = `
                  UPDATE Events
                  SET imagePath = @imagepath
                  WHERE id = @eventid`;
              
              const updateRequest = transaction.request();
              updateRequest.input("imagepath", newFilePath);
              updateRequest.input("eventid", eventId);
              await updateRequest.query(updateQuery);
          }
  
          await transaction.commit();
  
          // Retrieve the newly created event using its ID
          const createdEvent = await this.getEventById(eventId);

          return createdEvent;
      } catch (error) {
          await transaction.rollback();
          throw new Error("Error creating event: " + error.message);
      } finally {
          await connection.close();
      }
  }

    /* Update Event */
    static async updateEvent(id, newEventData) {
      let transaction;
    let connection;

    try {
      // Establish the connection
      connection = await sql.connect(dbConfig);

      // Begin transaction
      transaction = new sql.Transaction(connection);
      await transaction.begin();

      // Query for the old image path
      const request = new sql.Request(transaction);
      const oldImageQuery = `SELECT imagePath FROM Events WHERE id = @id`;
      request.input('id', sql.Int, id);
      const result = await request.query(oldImageQuery);

      let oldImagePath;
      if (result.recordset.length > 0) {
          oldImagePath = result.recordset[0].imagePath;
      }

      // Prepare the update query with dynamic fields
      const fields = Object.entries(newEventData);
      const updatedFields = fields
          .filter(([key, value]) => value !== undefined && key !== 'imagePath') // Filter out undefined values and imagePath
          .map(([key, value]) => `${key} = @${key}`);

      // Add the imagePath field to the query if a new image is provided
      let relativeImagePath;
      let newImagePath;
      if (newEventData.imagePath) {
          // Make sure to use the relative path for the new image
          relativeImagePath = `\\html\\images\\events\\Image_${id}${path.extname(newEventData.imagePath)}`;
          console.log("relativeImagePath", relativeImagePath);
          newImagePath = newEventData.imagePath; // Store the original path
          updatedFields.push(`imagePath = @imagePath`);
      }

      console.log("newimagepath", newImagePath);

      const sqlQuery = `UPDATE Events SET ${updatedFields.join(', ')}
                        WHERE id = @eventId`; // Parameterized query

      // Bind the parameters to the request
      fields.forEach(([key, value]) => {
          if (key !== 'imagePath') {
              request.input(key, value || null);
          }
      });

      if (relativeImagePath) {
          request.input('imagePath', relativeImagePath);
      }

      request.input("eventId", sql.Int, id);
      await request.query(sqlQuery);

      // Save the new file
      if (newEventData.imagePath) {
          const newFilePath = path.join(__dirname, "..", "public", relativeImagePath);
          console.log("newFilePath", newFilePath);

          // Ensure the destination directory exists
          const destDir = path.dirname(newFilePath);
          if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
          }

          // Use the original path directly if it's absolute
          let sourceFilePath = newImagePath;
          if (!path.isAbsolute(newImagePath)) {
              sourceFilePath = path.join(__dirname, "..", "public", newImagePath);
          }

          console.log("sourceFilePath", sourceFilePath);
          if (!fs.existsSync(sourceFilePath)) {
              throw new Error(`Source file does not exist: ${sourceFilePath}`);
          }

          // Rename the new file first
          fs.renameSync(sourceFilePath, newFilePath);
          console.log(`File renamed from ${sourceFilePath} to ${newFilePath}`);

      }

      // Commit transaction
      await transaction.commit();
      console.log("Event updated successfully.");

      return await this.getEventById(id);

    } catch (err) {
        console.error("Error updating event:", err);
        // Rollback transaction in case of error
        if (transaction) {
            await transaction.rollback();
        }
    } finally {
        if (connection) {
            connection.close();
        }
    }
      
      // const connection = await sql.connect(dbConfig);
    
      // if (newEventData.imagePath) {
      //   // Delete the old file if it exists
      //   const oldFilePath = path.join(__dirname, "../public/images/events", `Image_${id}${path.extname(newEventData.imagePath)}`);
      //   if (fs.existsSync(oldFilePath)) {
      //     fs.unlink(oldFilePath, (err) => {
      //         if (err) {
      //             console.error("Error deleting the old file:", err);
      //         } else {
      //             console.log("Old file deleted successfully.");
      //         }
      //     });
      //   }

      //   // Save the new file
      //   fs.rename(newEventData.imagePath, oldFilePath, (err) => {
      //     if (err) {
      //         return res.status(500).send('Error saving the new file.');
      //     }

      //   });
      // }
      // // Extract fields and values from newEventData
      // const fields = Object.entries(newEventData);
      // const keys = fields.map(([key, value]) => key); // Extract keys from newEventData
      // const values = fields.map(([key, value]) => value); // Extract values from newEventData

      // // Update only fields that have values
      // const updatedFields = fields
      // .filter(([key, value]) => value !== undefined) // Filter out undefined values
      // .map(([key, value]) => `${key} = @${key}`);

      // // Check if there are fields to update
      // if (updatedFields.length === 0) {
      //   throw new Error('No fields to update');
      // }

      // // Include modifieddate in the SQL query
      // updatedFields.push('modifieddate = @modifieddate');

      // const sqlQuery = `UPDATE Events SET ${updatedFields.join(', ')}
      //                 WHERE id = @id`; // Parameterized query

      // const request = connection.request();

      // request.input("id", id);
      // // request.input("name", newEventData.name || null); // Handle optional fields
      // // request.input("description", newEventData.description || null); // Handle optional fields
      // // request.input("type", newEventData.type || null); // Handle optional fields
      // // request.input("startdate", newEventData.startDate || null); // Handle optional fields
      // // request.input("enddate", newEventData.endDate || null); // Handle optional fields
      // // request.input("imagepath", newEventData.imagePath || null); // Handle optional fields
      // // request.input("modifieddate", new Date().toISOString().slice(0, 19));
      // fields.forEach(([key, value]) => {
      //   request.input(key, value || null);
      // });
      //   // Always set the modified date
      // request.input("modifieddate", new Date().toISOString().slice(0, 19).replace('T', ' '));

      // const result = await request.query(sqlQuery);

      // console.log("Update result:", result);

      // connection.close();

      // if (result.rowsAffected[0] === 0) {
      //   return null; // No rows updated
      // }

      // return this.getEventById(id); // returning the updated book data
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
        // const query = `
        //   // SELECT e.id AS event_id, e.name, e.description, e.type, e.startDate, e.endDate, e.imagePath, u.id AS user_id, u.username, u.email
        //   // FROM Events e
        //   // INNER JOIN EventUsers eu ON eu.event_id = e.id
        //   // LEFT JOIN Users u ON eu.user_id = u.id
        //   // ORDER BY e.id;
        // `;

        const query=`
        SELECT e.id AS event_id, e.name, e.description, e.type, e.startDate, e.endDate, e.imagePath, u.userId AS user_id, u.username, u.email
          FROM Events e
          INNER JOIN EventUsers eu ON eu.event_id = e.id
          LEFT JOIN Users u ON eu.user_id = u.userId
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
            SELECT SCOPE_IDENTITY() AS id;`;
      
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

    //Get Specific Event with Users
    static async getSpecificEventwithUsers(userId) {
      const connection = await sql.connect(dbConfig);

      try {
        const query = `
          SELECT u.userId AS user_id, username, email, e.id AS event_id, name, type, startDate, endDate, imagePath
          FROM Users u
          INNER JOIN EventUsers eu ON eu.user_id = u.userId
          LEFT JOIN Events e ON eu.event_id = e.id
          WHERE u.userId = @userId;
        `;
  
        const request = await connection.request();
        request.input("userId", userId);
        const result = await request.query(query);
  
        connection.close();
        // Group users and their books
        //console.log(result.recordset);

        // Modify this so that it doesnt loop but instead only show 1
        const userWithEvents = {};
        for (const row of result.recordset) {
          const userId = row.user_id;
          if (!userWithEvents[userId]) {
            userWithEvents[userId] = {
              id: userId,
              username: row.username,
              email: row.email,
              events: [],
            };
          }
          userWithEvents[userId].events.push({
            id: row.event_id,
            name: row.name,
            type: row.type,
            startDate: row.startDate,
            endDate: row.endDate,
            imagePath: row.imagePath
          });
        }
  
        return Object.values(userWithEvents);
      } catch (error) {
        throw new Error("Error fetching specific user with events");
      } finally {
        await connection.close();
      }
  }
  
  static async checkIfUserJoinedEvent(eventId, userId) {
    const connection = await sql.connect(dbConfig);
    console.log("eventId", eventId);

    try {
      const query = `
      SELECT CASE WHEN EXISTS (
        SELECT 1
        FROM EventUsers
        WHERE event_id = @eventId
        AND user_id = @userId
      ) THEN 1 ELSE 0 END AS 'exists';
      `;

      const request = await connection.request();
      request.input("eventId", eventId);
      request.input("userId", userId);
      const result = await request.query(query);

      console.log('Query Result:', result);

      return result.recordset[0].exists === 1;

    } catch (error) {
      throw new Error("Error checking if user joined event");
    } finally {
      await connection.close();
    }
  }
  static async addLocation(locationData, transaction) {
    try {
      const query = `
        INSERT INTO EventLocations (locationName, address, postalCode, country)
        VALUES (@name, @address, @postalCode, @country);
        SELECT SCOPE_IDENTITY() AS id;
      `; // Retrieve ID of inserted record

      const request = transaction.request();
      request.input("name", locationData.locationName);
      request.input("address", locationData.address);
      request.input("postalCode", locationData.postalCode);
      request.input("country", locationData.country);

      const result = await request.query(query);
      return result;
    } catch (error) {
      throw new Error("Error adding location: " + error.message);
    }
  }
}



module.exports = Event;

