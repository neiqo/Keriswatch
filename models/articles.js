const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Article {
  constructor(
    articleID,
    Author,
    Publisher,
    Sector,
    Title,
    Body,
    publishDateTime,
    Tags
  ) {
    this.articleID = articleID;
    this.Author = Author;
    this.Publisher = Publisher;
    this.Sector = Sector;
    this.Title = Title;
    this.Body = Body;
    this.publishDateTime = publishDateTime;
    this.Tags = Tags;
  }

  static async getAllArticles() {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Articles`;

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset.map(
      (row) => new Article(
        row.articleID,
        row.Author,
        row.Publisher,
        row.Sector,
        row.Title,
        row.Body,
        row.publishDateTime,
        row.Tags
      ));
  }
}

module.exports = Article;
