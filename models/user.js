const sql = require("mssql");
const dbConfig = require("../dbConfig");

// is there a need for role? cuz can use type of class to find out the role, so shld i remove?
class User {
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }

    static async loginUser(email, password) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE email = @Email AND password = @Password`;

        const request = connection.request();
        request.input('Email', sql.VarChar, email); // specify data type varchar to avoid system misinterpretation
        request.input('Password', sql.VarChar, password); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        const user = result.recordset[0];

        if (!user) return null; // if no user found, return null

        switch (user.role) {
            case 'NormalUser':
                return await NormalUser.getNormalUserByUsername(user.username);
            case 'Admin':
                return new Admin(user.username, user.password, user.email);
            case 'Organisation':
                return await Organisation.getOrganisationByUsername(user.username);
            default:
                return new User(user.username, user.password, user.email);
        }
    }

    static async getUserByUsername(username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE username = @Username`;

        const request = connection.request();
        request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        const user = result.recordset[0];

        if (!user) return null; // if no user found, return null

        switch (user.role) {
            case 'NormalUser':
                return await NormalUser.getNormalUserByUsername(username);
            case 'Admin':
                return new Admin(user.username, user.password, user.email);
            case 'Organisation':
                return await Organisation.getOrganisationByUsername(username);
            default:
                throw new Error('Error identifying user role');
        }
    }
}

// Normal User class
class NormalUser extends User {
    constructor(username, password, email, country) {
        super(username, password, email);
        this.country = country;
    }

    static role = "NormalUser";

    // Normal user-specific methods
    static async createAccount(user) {

        // if username already exists, throw error
        if (await this.getNormalUserByUsername(user.username) != null) {
            throw new Error('User already exists');
        }

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
            request.input('Country', sql.VarChar, user.country);
            request.input('Role', sql.VarChar, this.role);

            console.log(this.role);

            // Insert into Users table and get the new user_id
            const insertUserQuery = `INSERT INTO Users (username, password, email, role)
                                     VALUES (@Username, @Password, @Email, @Role);
                                     SELECT SCOPE_IDENTITY() AS user_id;`;
            
            const userResult = await request.query(insertUserQuery);
            const userId = userResult.recordset[0].user_id;

            // Insert into NormalUsers table
            const insertNormalUserQuery = `INSERT INTO NormalUser (user_id, username, password, email, country)
                                           VALUES (@UserId, @Username, @Password, @Email, @Country)`;
            request.input('UserId', sql.Int, userId);
            await request.query(insertNormalUserQuery);

            await transaction.commit();
            connection.close();

            return this.getNormalUserByUsername(user.username);
        } catch (err) {
            await transaction.rollback();
            connection.close();
            throw new Error('Error creating account: ' + err.message);
        }
    }

    static async getNormalUserByUsername(username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM NormalUser WHERE username = @Username`;

        console.log(username);

        const request = connection.request();
        request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        console.log(result.recordset);

        return result.recordset[0]
        ? new NormalUser(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordset[0].email,
            result.recordset[0].country
          )
        : null;
    }

    static async updateAccountDetails(user) {

        // if username does not exist, throw error
        let oldUserDetails = null;

        console.log(user.oldUsername);

        if ((oldUserDetails = await this.getNormalUserByUsername(user.oldUsername)) == null) {
            throw new Error('User does not exist');
        }

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
                                     WHERE username = @oldUsername`;
            await request.query(updateUserQuery);

            // Update NormalUsers table
            const updateNormalUserQuery = `UPDATE NormalUser
                                           SET username = @Username, password = @Password, email = @Email, country = @Country
                                           WHERE username = @oldUsername`;
            await request.query(updateNormalUserQuery);

            await transaction.commit();
            connection.close();

            return this.getNormalUserByUsername(user.username);
        } catch (err) {
            await transaction.rollback();
            connection.close();
            throw new Error('Error updating account: ' + err.message);
        }
    }
}

// Admin class
class Admin extends User {
    constructor(username, password, email) {
        super(username, password, email);
    }

    static role = "Admin";

    // Admin-specific methods
    
    // to be used for viewing all profiles as admin
    static async getAllUsers() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE role = 'NormalUser' OR role = 'Organisation'`;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map (user => {
            return user.role == 'NormalUser'
            ? new NormalUser(
                user.username,
                user.password,
                user.email,
                user.country
              )
            : new Organisation(
                user.username,
                user.password,
                user.email,
                user.orgNumber
              );
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
            const roleQuery = `SELECT role FROM Users WHERE username = @Username AND role != 'Admin'`;
            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, username);
            const roleResult = await request.query(roleQuery);

            if (roleResult.recordset.length === 0) {
                // No user found or user is an Admin
                await transaction.rollback();
                connection.close();
                return false;
            }

            const role = roleResult.recordset[0].role;

            // Delete from the specific table
            let deleteSpecificQuery;
            if (role === 'NormalUser') {
                deleteSpecificQuery = `DELETE FROM NormalUser WHERE username = @Username`;
            } else if (role === 'Organisation') {
                deleteSpecificQuery = `DELETE FROM Organisation WHERE username = @Username`;
            }

            await request.query(deleteSpecificQuery);

            // Delete from the Users table
            const deleteUserQuery = `DELETE FROM Users WHERE username = @Username`;
            await request.query(deleteUserQuery);

            // Commit the transaction
            await transaction.commit();
            connection.close();
            return true; // if successful, returns true
        } catch (err) {
            // Rollback the transaction in case of error
            await transaction.rollback();
            connection.close();
            throw new Error('Error deleting user: ' + err.message);
        }
    }
}

// Organisation class
class Organisation extends User {
    constructor(username, password, email, orgNumber) {
        super(username, password, email);
        this.orgNumber = orgNumber;
    }
    
    static role = "Organisation";

    // Organisation-specific methods
    static async createAccount(user) {

        // if username already exists, throw error
        if (await this.getOrganisationByUsername(user.username) != null) {
            throw new Error('Organisation already exists');
        }


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
            request.input('Role', sql.VarChar, this.role);

            console.log(this.role);

            // Insert into Users table and get the new user_id
            const insertUserQuery = `INSERT INTO Users (username, password, email, role)
                                        VALUES (@Username, @Password, @Email, @Role);
                                        SELECT SCOPE_IDENTITY() AS user_id;`;
            
            const userResult = await request.query(insertUserQuery);
            const userId = userResult.recordset[0].user_id;

            // Insert into Organisations table
            const insertOrganisationQuery = `INSERT INTO Organisation (user_id, username, password, email, orgNumber)
                                        VALUES (@UserId, @Username, @Password, @Email, @OrgNumber)`;
            request.input('UserId', sql.Int, userId);
            await request.query(insertOrganisationQuery);

            await transaction.commit();
            connection.close();

            return this.getOrganisationByUsername(user.username);
        } catch (err) {
            await transaction.rollback(); // at least one of the queries failed, so discard changes
            connection.close();
            throw new Error('Error creating account: ' + err.message);
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
        ? new Organisation(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordset[0].email,
            result.recordset[0].orgNumber
          )
        : null;
    }

    static async updateAccountDetails(user) {

        let oldUserDetails = null;

        // if username does not exist, throw error
        if ((oldUserDetails = await this.getOrganisationByUsername(user.oldUsername)) == null) {
            throw new Error('Organisation does not exist');
        }

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
                                     WHERE username = @oldUsername`;
            await request.query(updateUserQuery);

            // Update NormalUsers table
            const updateOrganisationQuery = `UPDATE Organisation
                                           SET username = @Username, password = @Password, email = @Email, orgNumber = @OrgNumber
                                           WHERE username = @oldUsername`;
            await request.query(updateOrganisationQuery);

            await transaction.commit();
            connection.close();

            return this.getOrganisationByUsername(user.username);
        } catch (err) {
            await transaction.rollback();
            connection.close();
            throw new Error('Error updating account: ' + err.message);
        }
    }
}

module.exports = { User, NormalUser, Admin, Organisation };
