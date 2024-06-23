const sql = require("mssql");
const dbConfig = require("../dbConfig");


let users = [];

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
                return await NormalUser.getNormalUserByUsername(username);
            case 'Admin':
                return new Admin(user.username, user.password, user.email);
            case 'Organisation':
                return await Organisation.getOrganisationByUsername(username);
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

    // Normal user-specific methods
    static async createAccount(user) {
        const connection = await sql.connect(dbConfig);

        // if username already exists, throw error
        if (await this.getNormalUserByUsername(user.username) != null) {
            connection.close();
            throw new Error('User already exists');
        }

        try {
            // Transaction is used incase one of the 2 insert queries fails, and we want to rollback the entire transaction
            const transaction = new sql.Transaction(connection);
            await transaction.begin();

            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, user.username);
            request.input('Password', sql.VarChar, user.password);
            request.input('Email', sql.VarChar, user.email);
            request.input('Country', sql.VarChar, user.country);

            // Insert into Users table and get the new user_id
            const insertUserQuery = `INSERT INTO Users (username, password, email)
                                     VALUES (@Username, @Password, @Email);
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

        const request = connection.request();
        request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
        ? new NormalUser(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordest[0].email,
            result.recordset[0].country
          )
        : null;
    }

    static async updateAccountDetails(user) {
        const connection = await sql.connect(dbConfig);

        // if username does not exist, throw error
        if (await this.getNormalUserByUsername(user.username) == null) {
            connection.close();
            throw new Error('User does not exist');
        }

        try {
            // Transaction is used incase one of the 2 insert queries fails, and we want to rollback the entire transaction
            const transaction = new sql.Transaction(connection);
            await transaction.begin();

            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, user.username);
            request.input('Password', sql.VarChar, user.password);
            request.input('Email', sql.VarChar, user.email);
            request.input('Country', sql.VarChar, user.country);

            // Update Users table
            const updateUserQuery = `UPDATE Users
                                     SET password = @Password, email = @Email
                                     WHERE username = @Username`;
            await request.query(updateUserQuery);

            // Update NormalUsers table
            const updateNormalUserQuery = `UPDATE NormalUser
                                           SET password = @Password, email = @Email, country = @Country
                                           WHERE username = @Username`;
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
        const sqlQuery = `DELETE FROM Users WHERE username = @Username`;

        const request = connection.request();
        request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        return result.rowsAffected[0] > 0; // if successful, returns true, else false
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
        const connection = await sql.connect(dbConfig);

        // if username already exists, throw error
        if (await this.getOrganisationByUsername(user.username) != null) {
            connection.close();
            throw new Error('Organisation already exists');
        }

        try {
            // Transaction is used in case one of the 2 insert queries fails, and we want to rollback the entire transaction
            const transaction = new sql.Transaction(connection);
            await transaction.begin();

            const request = new sql.Request(transaction); // allows multiple queries to be tied to the same transaction
            request.input('Username', sql.VarChar, user.username);
            request.input('Password', sql.VarChar, user.password);
            request.input('Email', sql.VarChar, user.email);
            request.input('OrgNumber', sql.Int, user.orgNumber);

            // Insert into Users table and get the new user_id
            const insertUserQuery = `INSERT INTO Users (username, password, email)
                                     VALUES (@Username, @Password, @Email);
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

        return result.recordset[0]
        ? new Organisation(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordest[0].email,
            result.recordset[0].orgNumber
          )
        : null;
    }

    static async updateAccountDetails(user) {
        const connection = await sql.connect(dbConfig);

        // if username does not exist, throw error
        if (await this.getOrganisationByUsername(user.username) == null) {
            connection.close();
            throw new Error('Organisation does not exist');
        }

        try {
            // Transaction is used incase one of the 2 insert queries fails, and we want to rollback the entire transaction
            const transaction = new sql.Transaction(connection);
            await transaction.begin();

            const request = new sql.Request(transaction);
            request.input('Username', sql.VarChar, user.username);
            request.input('Password', sql.VarChar, user.password);
            request.input('Email', sql.VarChar, user.email);
            request.input('OrgNumber', sql.Int, user.orgNumber);

            // Update Users table
            const updateUserQuery = `UPDATE Users
                                     SET password = @Password, email = @Email
                                     WHERE username = @Username`;
            await request.query(updateUserQuery);

            // Update NormalUsers table
            const updateOrganisationQuery = `UPDATE Organisation
                                           SET password = @Password, email = @Email, orgNumber = @OrgNumber
                                           WHERE username = @Username`;
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
