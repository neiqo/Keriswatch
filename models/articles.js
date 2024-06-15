const sql = require("mssql");
const dbConfig = require("../dbConfig");
const fs = require("fs");
const util = require("util");

// Promisify the fs.mkdir function for easier async handling
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
    imageFileNames // Include imageFileNames in constructor
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
    this.imageFileNames = imageFileNames; // Assign imageFileNames to instance property
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

    // Initialize map to store articles with the images grouped by their article ID
    const articlesMap = new Map();

    // Process each row from the query result
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
                imageFileNames: [] // Initialize empty array for imageFileNames
            });
        }

        // Push ImageFileName to imageFileNames array if it exists
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
            articleData.imageFileNames // Include imageFileNames in Article constructor
        )
    );

    // Create image folders for each article
    await Promise.all(articles.map(article => article.createImageFolder()));

    return articles;
  }

  async createImageFolder() {
    const folderPath = `./public/html/media/images/article-${this.articleID}`;

    try {
      // Check if the folder already exists
      await fs.promises.access(folderPath, fs.constants.F_OK);
      console.log(`Folder already exists for article ${this.articleID}`);
    } catch (err) {
      // Folder does not exist, create it
      try {
        await mkdirAsync(folderPath);
        console.log(`Created folder for article ${this.articleID}: ${folderPath}`);
      } catch (error) {
        console.error(`Error creating folder for article ${this.articleID}:`, error);
      }
    }
  }
}

module.exports = Article;
