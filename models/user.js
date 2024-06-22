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

        return result.recordset[0]
        ? new User(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordest[0].email,
          )
        : null;
    }

    static async getUserByUsername(username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE username = @Username`;

        const request = connection.request();
        request.input('Username', sql.VarChar, username); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
        ? new User(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordest[0].email,
          )
        : null;
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
        if (await this.getUserByUsername(user.username) != null) {
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
            const insertNormalUserQuery = `INSERT INTO NormalUsers (user_id, username, password, email, country)
                                           VALUES (@UserId, @Username, @Password, @Email, @Country)`;
            request.input('UserId', sql.Int, userId);
            await request.query(insertNormalUserQuery);

            await transaction.commit();
            connection.close();

            return this.getUserByUsername(user.username);
        } catch (err) {
            await transaction.rollback();
            connection.close();
            throw new Error('Error creating account: ' + err.message);
        }
    }
    
    // override login method
    static async loginUser(email, password) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE email = @Email AND password = @Password`;

        const request = connection.request();
        request.input('Email', sql.VarChar, email); // specify data type varchar to avoid system misinterpretation
        request.input('Password', sql.VarChar, password); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
        ? new NormalUser(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordset[0].email,
            result.recordset[0].country
          )
        : null;
    }

    static async getUserByUsername(username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE username = @Username`;

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
}

// Admin class
class Admin extends User {
    constructor(username, password, email) {
        super(username, password, email);
    }

    // Admin-specific methods
    
    // override login method
    static async loginUser(email, password) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE email = @Email AND password = @Password`;

        const request = connection.request();
        request.input('Email', sql.VarChar, email); // specify data type varchar to avoid system misinterpretation
        request.input('Password', sql.VarChar, password); // specify data type varchar to avoid system misinterpretation

        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
        ? new Admin(
            result.recordset[0].username,
            result.recordset[0].password,
            result.recordest[0].email,
          )
        : null;
    }
}

// Organisation class
class Organisation extends User {
    constructor(username, password, email, orgNumber) {
        super(username, password, email);
        this.orgNumber = orgNumber;
    }

    // Organisation-specific methods
    static async createAccount(username, password, email, orgNumber) {
        const connection = await sql.connect(dbConfig);

        // if username already exists, throw error
        if (await this.checkUserExists(username) > 0) {
            connection.close();
            // do i throw new error or console.log the issue then return?
            throw new Error('Organisation name already exists');
        }

        const sqlQuery = `INSERT INTO Users (username, password)
                        VALUES ('${username}', '${password}'); 
                        INSERT INTO Organisations (username, password, email, orgNumber) 
                        VALUES ('${username}', '${password}', '${email}', '${orgNumber}')`;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        
        connection.close();
        
        return result;
    } 

    static async createAccount(user) {
        const connection = await sql.connect(dbConfig);

        // if username already exists, throw error
        if (await this.getUserByUsername(user.username) != null) {
            connection.close();
            throw new Error('User already exists');
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
            const insertOrganisationQuery = `INSERT INTO Organiastions (user_id, username, password, email, orgNumber)
                                           VALUES (@UserId, @Username, @Password, @Email, @OrgNumber)`;
            request.input('UserId', sql.Int, userId);
            await request.query(insertOrganisationQuery);

            await transaction.commit();
            connection.close();

            return this.getUserByUsername(user.username);
        } catch (err) {
            await transaction.rollback(); // at least one of the queries failed, so rollback
            connection.close();
            throw new Error('Error creating account: ' + err.message);
        }
    }    

    static async getUserByUsername(username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE username = @Username`;

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
}

module.exports = { User, NormalUser, Admin, Organisation };
