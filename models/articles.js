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
    const folderPath = `./public/html/images/articles/article-${this.articleID}`;

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

  // CREATE ARTICLE
  // 1. get the new article data from the input (from a form on the page)
  // 2. insert the new article into the Articles table first
  // 3. go through all the filenames of the images that has been uploaded and get it
  // 4. insert the image filename into the ArticleImages that has been processed by the multer config
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

      // insert new article but no image filename yet
      const result = await request.query(insertArticleQuery);
      const newArticleID = result.recordset[0].articleID;

        // loop through each image file name in the imageFileNames array
        for (const imageFileName of imageFileNames) {
        const insertImageRequest = new sql.Request(transaction); // make new sql request for each image insert
        
        // sql query to insert image file name 
        const insertImageQuery = `
          INSERT INTO ArticleImages (ArticleID, ImageFileName)
          VALUES (@ArticleID, @ImageFileName)
        `;

        // insert the associated articleid and image filename to the ArticleImages table
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

  // DELETE ARTICLE
  // 1. get image filenames for the article want to delete using the articleID
  // 2. delete the image filenames in ArticleImages table first beacuse of the foreign key relation
  // 3. then delete the article form the Articles table
  // 4. go into the folder that holds the images associating with the article
  // 5. clear the whole folder
  // 6. if it is clear then remove the folder from the system
  static async deleteArticle(articleID) {
    const connection = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(connection);
  
    try {
      await transaction.begin();
  
      const request = new sql.Request(transaction);
  
      // Get image filenames to delete from files
      const getImageFilenamesQuery = `SELECT ImageFileName FROM ArticleImages WHERE ArticleID = @ArticleID`;
      request.input('ArticleID', sql.Int, articleID);
      const result = await request.query(getImageFilenamesQuery);
  
      const imageFileNames = result.recordset.map(row => row.ImageFileName);
    
      // delete images filenames from ArticleImages table first
      const deleteImagesQuery = `DELETE FROM ArticleImages WHERE ArticleID = @ArticleID`;
      await request.query(deleteImagesQuery);
  
      // finally delete article from Articles table
      const deleteArticleQuery = `DELETE FROM Articles WHERE articleID = @ArticleID`;
      const deleteResult = await request.query(deleteArticleQuery);
  
      console.log('Delete article result:', deleteResult);
  
      if (deleteResult.rowsAffected[0] === 0) {
        throw new Error(`Article with ID ${articleID} not found`);
      }
  
      await transaction.commit();
  
      // Delete image files from the filesystem
      const articleImageFolderPath = path.join(__dirname, `../public/html/images/articles/article-${articleID}`);
  
      if (fs.existsSync(articleImageFolderPath)) {
        imageFileNames.forEach(imageFileName => {
          const imagePath = path.join(articleImageFolderPath, imageFileName);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
        // Remove article image folder if empty
        if (fs.readdirSync(articleImageFolderPath).length === 0) {
          fs.rmdirSync(articleImageFolderPath);
        }
      }
  
      return true;
    } catch (error) {
      console.error("Error deleting article: ", error);
      await transaction.rollback();
      throw error;
    } finally {
      connection.close();
    }
  }

  static async getArticleByID(articleID) {
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
      WHERE a.articleID = @articleID
    `;
  
    const request = connection.request();
    request.input('articleID', sql.Int, articleID);
    const result = await request.query(sqlQuery);
  
    connection.close();
  
    if (result.recordset.length === 0) {
      return null;
    }
  
    const articleData = {
      articleID: result.recordset[0].articleID,
      Author: result.recordset[0].Author,
      Publisher: result.recordset[0].Publisher,
      Country: result.recordset[0].Country,
      Sector: result.recordset[0].Sector,
      Title: result.recordset[0].Title,
      Body: result.recordset[0].Body,
      publishDateTime: result.recordset[0].publishDateTime,
      Tags: result.recordset[0].Tags,
      imageFileNames: []
    };
  
    result.recordset.forEach(row => {
      if (row.ImageFileName) {
        articleData.imageFileNames.push(row.ImageFileName);
      }
    });
  
    return new Article(
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
    );
  } 
  
  static async editTags(articleID, newTags) {
    const connection = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(connection);

    try {
      await transaction.begin();

      const request = new sql.Request(transaction);

      const updateTagsQuery = `
        UPDATE Articles
        SET Tags = @Tags
        WHERE articleID = @ArticleID
      `;

      request.input('Tags', sql.NVarChar, newTags);
      request.input('ArticleID', sql.Int, articleID);

      const result = await request.query(updateTagsQuery);

      if (result.rowsAffected[0] === 0) {
        throw new Error(`Article with ID ${articleID} not found`);
      }

      await transaction.commit();

      return true;
    } catch (error) {
      console.error('Error updating tags:', error);
      await transaction.rollback();
      throw error;
    } finally {
      connection.close();
    }
  }
}

module.exports = Article;
