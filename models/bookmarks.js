const sql = require("mssql");
const dbConfig = require("../dbConfig");
const fs = require("fs");
const util = require("util");
const path = require("path");

class Bookmark {
  constructor(id, userId, articleId, bookmarkDateTime){
      this.id = id;
      this.userId = userId;
      this.articleId = articleId;
      this.bookmarkDateTime = bookmarkDateTime;
  }

  static async getAllBookmarkedArticles(userId) {
    console.log('getAllBookmarkedArticles called with userId:', userId);

    const connection = await sql.connect(dbConfig);

    const sqlQuery = `
      SELECT b.*
      FROM Articles a JOIN Bookmarks b
      ON a.articleId = b.articleId
      WHERE b.userId = @userId
      ORDER BY b.bookmarkDateTime DESC`;

    const request = connection.request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(sqlQuery);
    connection.close();

    return result.recordset.map(
      (row) => new Bookmark(row.id, row.userId, row.articleId, row.bookmarkDateTime)
    );
  }

  static async addBookmark(userId, articleId) {

    try {
      const connection = await sql.connect(dbConfig);

      const sqlQuery = `INSERT INTO Bookmarks (userId, articleId) VALUES (@userId, @articleId);`;

      const request = connection.request();
      request.input("userId", sql.Int, userId);
      request.input("articleId", sql.Int, articleId);

      await request.query(sqlQuery); // Execute the query

      connection.close();

      // Return success message 
      return { userId, articleId, message: 'Bookmark added successfully' };
    } catch (error) {
      console.error('SQL error:', error);
      throw error;
    }
  }

  static async deleteBookmark(userId, articleId) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `DELETE FROM Bookmarks WHERE userId = @userId AND articleId = @articleId;`; // Parameterized query

    const request = connection.request();
    request.input("userId", sql.Int, userId);
    request.input("articleId", sql.Int, articleId);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.rowsAffected > 0; // Indicate success based on affected rows
  }

};

module.exports = Bookmark;