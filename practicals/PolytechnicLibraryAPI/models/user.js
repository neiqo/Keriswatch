const sql = require('mssql');

const registerUser = async (username, passwordHash, role) => {
    try {
      const request = new sql.Request();
      const query = `
        INSERT INTO Users (username, passwordHash, role)
        OUTPUT inserted.*
        VALUES ('${username}', '${passwordHash}', '${role}')
      `;
      const result = await request.query(query);
      console.log('Register User Result:', result);
      return result.recordset[0]; // Return the inserted user record
    } catch (error) {
      console.error('Error in registerUser:', error);
      throw error;
    }
  };
  
  const getUserByUsername = async (username) => {
    try {
      const request = new sql.Request();
      const result = await request.query(`SELECT * FROM Users WHERE username = '${username}'`);
      console.log('Get User By Username Result:', result);
      return result.recordset[0];
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  };

module.exports = {
  registerUser,
  getUserByUsername,
};

