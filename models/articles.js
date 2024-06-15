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
    Tags,
    imageFileNames // Include imageFileNames in constructor
  ) {
    this.articleID = articleID;
    this.Author = Author;
    this.Publisher = Publisher;
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

    // Initialize map to store articles grouped by articleID
    const articlesMap = new Map();

    // Process each row from the query result
    result.recordset.forEach((row) => {
        const {
            articleID,
            Author,
            Publisher,
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
            articleData.Sector,
            articleData.Title,
            articleData.Body,
            articleData.publishDateTime,
            articleData.Tags,
            articleData.imageFileNames // Include imageFileNames in Article constructor
        )
    );

    return articles;
}
}

module.exports = Article;
