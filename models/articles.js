const sql = require("mssql");
const dbConfig = require("../dbConfig");
const fs = require("fs");
const util = require("util");
const path = require("path");

const mkdirAsync = util.promisify(fs.mkdir);

class Article {
  constructor(
    articleID,
    Author,
    Publisher,
    Country,
    Sector,
    Title,
    Body,
    publishDateTime,
    Tags,
    imageFileNames
  ) {
    this.articleID = articleID;
    this.Author = Author;
    this.Publisher = Publisher;
    this.Country = Country;
    this.Sector = Sector;
    this.Title = Title;
    this.Body = Body;
    this.publishDateTime = publishDateTime;
    this.Tags = Tags;
    this.imageFileNames = imageFileNames;
  }

  static async getAllArticles() {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `
      SELECT 
        a.articleID,
        a.Author,
        a.Publisher,
        a.Country,
        a.Sector,
        a.Title,
        a.Body,
        a.publishDateTime,
        a.Tags,
        i.ImageFileName
      FROM Articles a
      LEFT JOIN ArticleImages i ON a.articleID = i.ArticleID
    `;

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    // Init map to store articles with the images grouped by their article ID
    const articlesMap = new Map();

    // Go through every row from query result
    result.recordset.forEach((row) => {
      const {
        articleID,
        Author,
        Publisher,
        Country,
        Sector,
        Title,
        Body,
        publishDateTime,
        Tags,
        ImageFileName
      } = row;

      // If articleID not yet in map, initialize with basic article data
      if (!articlesMap.has(articleID)) {
        articlesMap.set(articleID, {
          articleID,
          Author,
          Publisher,
          Country,
          Sector,
          Title,
          Body,
          publishDateTime,
          Tags,
          imageFileNames: []
        });
      }

      // Push ImageFileName to imageFileNames array if exists
      if (ImageFileName) {
        articlesMap.get(articleID).imageFileNames.push(ImageFileName);
      }
    });

    // Convert map values to array of Article instances
    const articles = Array.from(articlesMap.values()).map(
      (articleData) => new Article(
        articleData.articleID,
        articleData.Author,
        articleData.Publisher,
        articleData.Country,
        articleData.Sector,
        articleData.Title,
        articleData.Body,
        articleData.publishDateTime,
        articleData.Tags,
        articleData.imageFileNames
      )
    );

    // Create image folders for each article
    await Promise.all(articles.map(article => article.createImageFolder()));

    return articles;
  }

  async createImageFolder() {
    const folderPath = `./public/html/media/images/articles/article-${this.articleID}`;

    try {
      // Check if the folder exists
      await fs.promises.access(folderPath, fs.constants.F_OK);
    } catch (err) {
      // Create folder if does not exist
      try {
        await mkdirAsync(folderPath);
      } catch (error) {
        console.error(`Error creating folder for article ${this.articleID}:`, error);
      }
    }
  }

  static async createArticle(newArticleData, imageFileNames) {
    const connection = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(connection);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);

      const insertArticleQuery = `
        INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
        VALUES (@Author, @Publisher, @Country, @Sector, @Title, @Body, @publishDateTime, @Tags);
        SELECT SCOPE_IDENTITY() AS articleID;
      `;

      // Form params
      request.input('Author', sql.NVarChar, newArticleData.Author);
      request.input('Publisher', sql.NVarChar, newArticleData.Publisher);
      request.input('Country', sql.NVarChar, newArticleData.Country);
      request.input('Sector', sql.NVarChar, newArticleData.Sector);
      request.input('Title', sql.NVarChar, newArticleData.Title);
      request.input('Body', sql.NVarChar, newArticleData.Body);
      request.input('publishDateTime', sql.DateTime, new Date(newArticleData.publishDateTime));
      request.input('Tags', sql.NVarChar, newArticleData.Tags);

      // Insert new article but no image filename yet
      const result = await request.query(insertArticleQuery);
      const newArticleID = result.recordset[0].articleID;

        // Loop through each image file name in the imageFileNames array
        for (const imageFileName of imageFileNames) {
        const insertImageRequest = new sql.Request(transaction); // make new sql request for each image insert
        
        // sql query to insert image file name 
        const insertImageQuery = `
          INSERT INTO ArticleImages (ArticleID, ImageFileName)
          VALUES (@ArticleID, @ImageFileName)
        `;

        // insert the associated articleid and image filename
        insertImageRequest.input('ArticleID', sql.Int, newArticleID);
        insertImageRequest.input('ImageFileName', sql.NVarChar, imageFileName);
        await insertImageRequest.query(insertImageQuery);
      }

      await transaction.commit();
      return newArticleID;
    } catch (error) {
      console.error("Error creating article:", error);
      await transaction.rollback();
      throw error;
    } finally {
      connection.close();
    }
  }

}

module.exports = Article;
