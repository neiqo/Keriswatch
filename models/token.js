const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Token {
    constructor(id, userId, token, expiresAt) {
        this.id = id;
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    static async storeToken(user, token, expiresAt) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `INSERT INTO Tokens (userId, token, expiresAt) VALUES (@userId, @token, @expiresAt)`;
    
            const request = connection.request();
            request.input('userId', sql.Int, user.id);
            request.input('token', sql.VarChar, token);
            request.input('expiresAt', sql.DateTime, expiresAt); // specify data type to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);            
            connection.close();

            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error storing token:', err);
            connection.close();
            throw err;
        }
    }

    static async deleteToken(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `DELETE FROM Tokens WHERE userId = @userId`;
    
            const request = connection.request();
            request.input('userId', sql.Int, userId);
    
            const result = await request.query(sqlQuery);            
            connection.close();
    
            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error deleting token:', err);
            connection.close();
            throw err;
        }
    }
}

module.exports = Token;