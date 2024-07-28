const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { profile } = require("console");

class User {
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    // static async loginUser(email, password) {
    //     const connection = await sql.connect(dbConfig);
    //     const sqlQuery = `SELECT * FROM Users WHERE email = @Email AND password = @Password`;

    //     const request = connection.request();
    //     request.input('Email', sql.VarChar, email); // specify data type varchar to avoid system misinterpretation
    //     request.input('Password', sql.VarChar, password); // specify data type varchar to avoid system misinterpretation

    //     const result = await request.query(sqlQuery);
    //     connection.close();

    //     const user = result.recordset[0];

    //     if (!user) return null; // if no user found, return null

    //     switch (user.role) {
    //         case 'NormalUser':
    //             return await NormalUser.getNormalUserByUsername(user.username);
    //         case 'Admin':
    //             return new Admin(user.username, user.password, user.email);
    //         case 'Organisation':
    //             return await Organisation.getOrganisationByUsername(user.username);
    //         default:
    //             return new User(user.username, user.password, user.email);
    //     }
    // }

    static async getUserByEmail(email) {
        let connection;

        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE email = @Email`;
    
            const request = connection.request();
            request.input('Email', sql.VarChar, email); // specify data type varchar to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);
            connection.close();
    
            if (!result || !result.recordset) return null; // if no user found, return null
    
            return result.recordset[0];
        }
        catch (err) {
            connection.close();
            throw new Error('Error retrieving user: ' + err.message);
        }
    }
    static async getUserByUsername(username) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Users WHERE username = @Username`;
    
            const request = connection.request();
            request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);
            connection.close();
    
            console.log("Result in getUserByUsername: " + result.recordset[0]); 

            if (!result || !result.recordset) return null; // if no user found, return null
    
            return result.recordset[0];
        }
        catch {
            connection.close();
            throw new Error('Error retrieving user: ' + err.message);
        }
    }

    static async getProfilePicture(userId) {
        try {
            const connection = await sql.connect(dbConfig);
            console.log("UserID in getProfilePicture: " + userId);
            const sqlQuery = `SELECT profilePicture FROM Users WHERE userId = @UserId`;

            const request = connection.request();
            request.input('UserId', sql.Int, userId);

            const result = await request.query(sqlQuery);
            connection.close();

            if (!result || !result.recordset[0].profilePicture) return null; // if no user found, return null

            console.log("Result: " + result.recordset[0]);

            const profilePicture = result.recordset[0].profilePicture.toString('base64');

            return profilePicture;
        } catch (error) {
            console.error('Error getting profile picture:', error);
            return null;
        }
    }

    static async uploadProfilePicture(userId, profilePicture) { 
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `UPDATE Users SET profilePicture = @ProfilePicture WHERE userId = @UserId`;

            const request = connection.request();
            request.input('UserId', sql.Int, userId);
            // request.input('ProfilePicture', sql.VarChar, profilePicture);
            request.input("ProfilePicture", sql.VarBinary(sql.MAX), profilePicture);

            const result = await request.query(sqlQuery);
            connection.close();

            if (!result) return { success: false, message: 'No user found.'}; // if no user found, return null

            return { success: true, message: 'Profile picture uploaded successfully.'};

        } catch (error) {
            console.error('Error uploading profile picture:', error);
            return { success: false, message: 'Error uploading profile picture: ' + error.message };
        }
    }
}


// Normal User class
class NormalUser extends User {
    constructor(username, password, email, country) {
        super(username, password, email);
        this.country = country;
    }

    // Normal user-specific methods
    static async createAccount(user) {

        let transaction;
        let connection;

        try {
            // Transaction is used incase one of the 2 insert queries fails, and we want to rollback the entire transaction
            connection = await sql.connect(dbConfig);

            console.log(connection);

            transaction = new sql.Transaction(connection);

            await transaction.begin();
            
            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, user.username);
            request.input('Password', sql.VarChar, user.password);
            request.input('Email', sql.VarChar, user.email);
            request.input('Role', sql.VarChar, user.role);

            console.log("User role: " + user.role);

            // Insert into Users table and get the new userId
            const insertUserQuery = `INSERT INTO Users (username, password, email, role)
                                     VALUES (@Username, @Password, @Email, @Role);
                                     SELECT SCOPE_IDENTITY() AS userId;`;
            
            const userResult = await request.query(insertUserQuery);
            const userId = userResult.recordset[0].userId;

            console.log("Checking user : " + user);
            console.log("User details : " + userResult);
            console.log("User ID: " + userId);

            request.input('UserId', sql.Int, userId);
            request.input('Country', sql.VarChar, user.country);

            
            // Insert into NormalUser table
            const insertNormalUserQuery = `INSERT INTO NormalUser (userId, country)
                                           VALUES (@UserId, @Country);`;
            const normalUserResult = await request.query(insertNormalUserQuery);

            console.log("Normal User result : " + normalUserResult);

            await transaction.commit();
            connection.close();

            return { success: true, message: 'User signed up successfully', userId: userId };
        } catch (error) {
            await transaction.rollback();
            connection.close();
            console.error('Error creating account:', error);
            return { success: false, message: 'Error creating account: ' + error.message };
        }
    }

    static async getNormalUserByUsername(username) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM User WHERE username = @Username`;
    
            console.log("Username: " + username);
    
            const request = connection.request();
            request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);
            connection.close();
    
            console.log(result.recordset);
    
            return result.recordset[0]
            ? result.recordset[0]
            : null;
        }
        catch (err) {
            connection.close();
            throw new Error('Error retrieving user: ' + err.message);
        }
    }

    static async updateAccountDetails(user, oldUserDetails) {
        let connection;
        let transaction;

        try {
            connection = await sql.connect(dbConfig);

            // Transaction is used incase one of the 2 insert queries fails, and we want to rollback the entire transaction
            transaction = new sql.Transaction(connection);
            await transaction.begin();

            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, user.username || oldUserDetails.username);
            request.input('Password', sql.VarChar, user.password || oldUserDetails.password);
            request.input('Email', sql.VarChar, user.email || oldUserDetails.email);
            request.input('Country', sql.VarChar, user.country || oldUserDetails.country);
            request.input('oldUsername', sql.VarChar, oldUserDetails.username);

            // Update Users table
            const updateUserQuery = `UPDATE Users
                                     SET username = @Username, password = @Password, email = @Email
                                     WHERE username = @oldUsername;`;
            request.query(updateUserQuery);

            // Get the userId of the user
            const userIdQuery = `SELECT userId FROM Users WHERE username = @Username`;
            const userId = (await request.query(userIdQuery)).recordset[0].userId;

            request.input('UserId', sql.Int, userId);   

            // Update NormalUsers table
            const updateNormalUserQuery = `UPDATE NormalUser
                                           SET country = @Country
                                           WHERE userId = @UserId`;
            await request.query(updateNormalUserQuery);

            await transaction.commit();
            connection.close();

            return { success : true, message: 'User updated successfully', userId: userId, username : user.username || oldUserDetails.username};
        } catch (err) {
            await transaction.rollback();
            connection.close();
            // Return failure flag and error message
            return { success: false, errorMessage: 'Error updating account: ' + err.message };
        }
    }
}

// Admin class
class Admin extends User {
    constructor(username, password, email) {
        super(username, password, email);
    }

    // Admin-specific methods

    // to be used for viewing all profiles as admin
    static async getAllUsers() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `
            SELECT 
                u.username, u.password, u.email, u.role, 
                n.country AS country, o.orgNumber AS orgNumber
            FROM Users u
            LEFT JOIN NormalUser n ON u.userId = n.userId
            LEFT JOIN Organisation o ON u.userId = o.userId
            WHERE u.role = 'NormalUser' OR u.role = 'Organisation'
        `;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(user => {
            if (user.role == 'NormalUser') {
                return new NormalUser(
                    user.username,
                    user.password,
                    user.email,
                    user.country
                );
            } else {
                return new Organisation(
                    user.username,
                    user.password,
                    user.email,
                    user.orgNumber
                );
            }
        });
    }

    // to be used for deleting a normal user or organisation as admin
    static async deleteUser(username) {
        const connection = await sql.connect(dbConfig);

        // Start a transaction
        const transaction = new sql.Transaction(connection);
        try {
            await transaction.begin();

            // Check the role of the user
            const roleQuery = `SELECT role, userId FROM Users WHERE username = @Username AND role != 'Admin'`;
            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, username);
            const roleResult = await request.query(roleQuery);

            if (roleResult.recordset.length === 0) {
                // No user found or user is an Admin
                await transaction.rollback();
                connection.close();
                return { success : false, message: 'User does not exist, or user is not an admin.'};
            }

            const role = roleResult.recordset[0].role;

            request.input('UserId', sql.Int, roleResult.recordset[0].userId);

            // Delete from the specific table
            let deleteSpecificQuery;
            if (role === 'NormalUser') {
                deleteSpecificQuery = `DELETE FROM NormalUser WHERE userId = @UserId`;
            } else if (role === 'Organisation') {
                deleteSpecificQuery = `DELETE FROM Organisation WHERE userId = @UserId`;
            }

            await request.query(deleteSpecificQuery);

            // Delete from the Users table
            const deleteUserQuery = `DELETE FROM Users WHERE userId = @UserId`;
            await request.query(deleteUserQuery);

            // Commit the transaction
            await transaction.commit();
            connection.close();
            return { success : true, message: 'User deleted successfully'};
        } catch (err) {
            // Rollback the transaction in case of error
            await transaction.rollback();
            connection.close();
            return { success: false, errorMessage: 'Error deleting user: ' + err.message };
        }
    }
}

// Organisation class
class Organisation extends User {
    constructor(username, password, email, orgNumber) {
        super(username, password, email);
        this.orgNumber = orgNumber;
    }
    
    // Organisation-specific methods
    static async createAccount(user) {
        let transaction;
        let connection;

        try {
            // Transaction is used incase one of the 2 insert queries fails, and we want to rollback the entire transaction
            connection = await sql.connect(dbConfig);

            console.log(connection);

            transaction = new sql.Transaction(connection); 

            await transaction.begin();
            
            const request = new sql.Request(transaction); // allows multiple queries to be tied to the same transaction
            request.input('Username', sql.VarChar, user.username);
            request.input('Password', sql.VarChar, user.password);
            request.input('Email', sql.VarChar, user.email);
            request.input('OrgNumber', sql.Int, user.orgNumber);
            request.input('Role', sql.VarChar, user.role);

            console.log("Role: "+ user.role);

            // Insert into Users table and get the new userId
            const insertUserQuery = `INSERT INTO Users (username, password, email, role)
                                        VALUES (@Username, @Password, @Email, @Role);
                                        SELECT SCOPE_IDENTITY() AS userId;`;
            
            const userResult = await request.query(insertUserQuery);
            const userId = userResult.recordset[0].userId;

            // Insert into Organisations table
            const insertOrganisationQuery = `INSERT INTO Organisation (userId, orgNumber)
                                        VALUES (@UserId, @OrgNumber)`;
            request.input('UserId', sql.Int, userId);
            await request.query(insertOrganisationQuery);

            await transaction.commit();
            connection.close();

            return { success: true, message: 'User signed up successfully', userId: userId };
        } catch (error) {
            await transaction.rollback();
            connection.close();
            console.error('Error creating account:', error);
            return { success: false, message: 'Error creating account: ' + error.message };
        }
    }

    static async getOrganisationByUsername(username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Organisation WHERE username = @Username`;

        const request = connection.request();
        request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        console.log(result.recordset[0]);
        console.log(connection);

        return result.recordset[0]
        ? result.recordset[0]
        : null;
    }

    static async updateAccountDetails(user, oldUserDetails) {
        let connection;
        let transaction;

        try {
            connection = await sql.connect(dbConfig);

            // Transaction is used incase one of the 2 insert queries fails, and we want to rollback the entire transaction
            transaction = new sql.Transaction(connection);
            await transaction.begin();

            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, user.username || oldUserDetails.username);
            request.input('Password', sql.VarChar, user.password || oldUserDetails.password);
            request.input('Email', sql.VarChar, user.email || oldUserDetails.email);
            request.input('OrgNumber', sql.Int, user.orgNumber || oldUserDetails.orgNumber);
            request.input('oldUsername', sql.VarChar, oldUserDetails.username);

            // Update Users table
            const updateUserQuery = `UPDATE Users
                                     SET username = @Username, password = @Password, email = @Email
                                     WHERE username = @oldUsername;`;

            await request.query(updateUserQuery);

            const userIdQuery = `SELECT userId FROM Users WHERE username = @Username`;
            const userId = (await request.query(userIdQuery)).recordset[0].userId;

            request.input('UserId', sql.Int, userId);   

            // Update Organisation table
            const updateOrganisationQuery = `UPDATE Organisation
                                           SET orgNumber = @OrgNumber
                                           WHERE userId = @UserId`;
            await request.query(updateOrganisationQuery);

            await transaction.commit();
            connection.close();

            return { success : true, message: 'User updated successfully', userId: userId, username : user.username || oldUserDetails.username};
        } catch (err) {
            await transaction.rollback();
            connection.close();
            // Return failure flag and error message
            return { success: false, errorMessage: 'Error updating account: ' + err.message };
        }
    }
}

module.exports = { User, NormalUser, Admin, Organisation };
