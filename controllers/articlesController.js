const Article = require("../models/articles");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const path = require("path");
const fs = require("fs");

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.getAllArticles();
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving Articles");
  }
};

async function searchArticles(req, res) {
  const { query } = req.query;

  try {
    const connection = await sql.connect(dbConfig);
    let sqlQuery = `
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
        i.ImageFileName AS imageFileNames
      FROM Articles a
      LEFT JOIN ArticleImages i ON a.articleID = i.ArticleID
      WHERE 
        a.Author LIKE '%' + @query + '%' OR
        a.Publisher LIKE '%' + @query + '%' OR
        a.Country LIKE '%' + @query + '%' OR
        a.Sector LIKE '%' + @query + '%' OR
        a.Title LIKE '%' + @query + '%' OR
        a.Body LIKE '%' + @query + '%' OR
        a.Tags LIKE '%' + @query + '%'
    `;

    const request = connection.request();
    request.input('query', sql.VarChar, query);

    const result = await request.query(sqlQuery);

    // Aggregating image filenames into arrays by articleID
    const articlesMap = {};
    result.recordset.forEach(row => {
      if (!articlesMap[row.articleID]) {
        articlesMap[row.articleID] = {
          articleID: row.articleID,
          Author: row.Author,
          Publisher: row.Publisher,
          Country: row.Country,
          Sector: row.Sector,
          Title: row.Title,
          Body: row.Body,
          publishDateTime: row.publishDateTime,
          Tags: row.Tags,
          imageFileNames: []
        };
      }
      if (row.imageFileNames) {
        articlesMap[row.articleID].imageFileNames.push(row.imageFileNames);
      }
    });

    const articles = Object.values(articlesMap);

    res.json(articles);
  } catch (error) {
    console.error("Error searching articles:", error);
    res.status(500).json({ error: "Error searching articles" });
  }
}

const addArticle = async (req, res) => {
  try {
    const newArticleData = req.body; // get article data from the request body
    const imageFileNames = req.files ? req.files.map(file => file.filename) : []; // extract image filenames from uploaded files
    
    // make sure atleast have 1 image file
    if (imageFileNames.length === 0) {
      return res.status(400).json({ error: "At least one image is required to create an article." });
    }

    // create a new article and put it into the database
    const articleID = await Article.createArticle(newArticleData, imageFileNames);

    // after the article image folder is created, move the uploaded images from the temp folder to the associated article img folder
    for (const imageFileName of imageFileNames) {
      const oldPath = path.join(__dirname, '../uploads/temp', imageFileName); // temp folder
      const newDir = path.join(__dirname, `../public/html/media/images/articles/article-${articleID}`); // associated article image folder
      const newPath = path.join(newDir, imageFileName); // final place of the image

      // create the newDir folder if it doesnt exist
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      fs.renameSync(oldPath, newPath); // finally move the image from the temp folder to its final place
    }

    res.status(201).json({ message: "Article created successfully", articleID });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ error: "Error creating article" });
  }
}

module.exports = {
  getAllArticles,
  searchArticles,
  addArticle
};
