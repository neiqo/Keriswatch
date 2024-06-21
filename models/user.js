const sql = require("mssql");
const dbConfig = require("../dbConfig");

let users = [];

// is there a need for role? cuz can use type of class to find out the role, so shld i remove?
class User {
    constructor(username, password, role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    static async loginUser(username, password) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Users 
                        WHERE username = '${username}' AND password = '${password}'`;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        
        connection.close();
        
        // If user is found, return user data, otherwise return null
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    // static createUser(username, password, email, role, extraDetails = {}) {
    //     let user;
    //     switch (role) {
    //         case 'admin':
    //             user = new Admin(username, password, email, role);
    //             break;
    //         case 'organisation':
    //             user = new Organisation(username, password, email, role, extraDetails);
    //             break;
    //         case 'user':
    //             user = new NormalUser(username, password, email, role, extraDetails);
    //             break;
    //         default:
    //             throw new Error('Invalid role');
    //     }
    //     users.push(user);
    //     return user;
    // }

    // static findUserByUsername(username) {
    //     return users.find(user => user.username === username);
    // }
}

class NormalUser extends User {
    constructor(username, password, role, email, country) {
        super(username, password, role);
        this.email = email;
        this.country = country;
    }

    // Normal user-specific methods
    static async signUp(username, password, email, country) {
        const connection = await sql.connect(dbConfig);

        // if username already exists, throw error
        if (await this.checkUserExists(username) > 0) {
            connection.close();
            throw new Error('User already exists');
        }

        const sqlQuery = `INSERT INTO Users (username, password)
                        VALUES ('${username}', '${password}'); 
                        INSERT INTO NormalUsers (username, password, email, role, country) 
                        VALUES ('${username}', '${password}', '${email}', '${role}', '${country}')`;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        
        connection.close();
        
        return result;
    } 

    static async checkUserExists(username) { 
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Users 
                        WHERE username = '${username}'`;

        const request = connection.request();                
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.length;
    }
}

class Admin extends User {
    constructor(username, password, role, email) {
        super(username, password, role);
        this.email = email; 
    }

    // Admin-specific methods
}


class Organisation extends User {
    constructor(username, password, role, orgEmail, orgNumber) {
        super(username, password, role);
        this.email = orgEmail;
        this.orgNumber = orgNumber;
    }

    // Organisation-specific methods
    static async signUp(username, password, role, orgEmail, orgNumber) {
        const connection = await sql.connect(dbConfig);

        // if username already exists, throw error
        if (await this.checkUserExists(username) > 0) {
            connection.close();
            // do i throw new error or console.log the issue then return?
            throw new Error('Organisation name already exists');
        }

        const sqlQuery = `INSERT INTO Users (username, password)
                        VALUES ('${username}', '${password}'); 
                        INSERT INTO Organisations (username, password, role, email, orgNumber) 
                        VALUES ('${username}', '${password}', '${role}', '${orgEmail}', '${orgNumber}')`;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        
        connection.close();
        
        return result;
    } 

    static async checkUserExists(username) { 
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Users 
                        WHERE username = '${username}'`;

        const request = connection.request();                
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.length;
    }
}

module.exports = User, NormalUser, Admin, Organisation;
