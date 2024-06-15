const sql = require("mssql");
const dbConfig = require("../dbConfig");
const fs = require("fs");
const util = require("util");

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

    // init map to store articles with the images grouped by their article ID
    const articlesMap = new Map();

    // go through every row from query result
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

        // push imagefilename to imagefilenames array if exist
        if (ImageFileName) {
            articlesMap.get(articleID).imageFileNames.push(ImageFileName);
        }
    });

    // convert map values to array of Article instances
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

    // create image folders for each article
    await Promise.all(articles.map(article => article.createImageFolder()));

    return articles;
  }

  async createImageFolder() {
    const folderPath = `./public/html/media/images/articles/article-${this.articleID}`;

    try {
      // check if the folder exists
      await fs.promises.access(folderPath, fs.constants.F_OK);
    } catch (err) {
      // create folder if does not exist
      try {
        await mkdirAsync(folderPath);
      } catch (error) {
        console.error(`Error creating folder for article ${this.articleID}:`, error);
      }
    }
  }
}

module.exports = Article;
