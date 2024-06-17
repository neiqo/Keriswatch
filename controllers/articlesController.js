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
  const transaction = new sql.Transaction();
  try {
    const newArticleData = req.body;
    const imageFileNames = req.files ? req.files.map(file => file.filename) : [];

    if (imageFileNames.length === 0) {
      return res.status(400).json({ error: "At least one image is required to create an article." });
    }

    let articleID;

    try {
      // Start a transaction to ensure atomicity
      const connection = await sql.connect(dbConfig);
      await transaction.begin();

      // Create article in the database
      const articleID = await Article.createArticle(newArticleData, imageFileNames, transaction);


      if (!articleID) {
        throw new Error("Article ID not returned from createArticle function");
      }

      console.log(`New Article ID: ${articleID}`);

      // Commit transaction
      await transaction.commit();

      // Move files after committing the transaction
      for (const imageFileName of imageFileNames) {
        const oldPath = path.join(__dirname, '../uploads/temp', imageFileName);
        const newDir = path.join(__dirname, `../public/html/media/images/articles/article-${articleID}`);
        const newPath = path.join(newDir, imageFileName);

        if (!fs.existsSync(newDir)) {
          fs.mkdirSync(newDir, { recursive: true });
        }
        fs.renameSync(oldPath, newPath);
      }

      res.status(201).json({ message: "Article created successfully", articleID });
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();

      // Cleanup uploaded files in case of error
      imageFileNames.forEach(fileName => {
        const filePath = path.join(__dirname, '../uploads/temp', fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      console.error("Error creating article:", error);
      return res.status(500).json({ error: "Error creating article" });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Unexpected error occurred while creating article" });
  }
};


const removeArticle = async (req, res) => {
  const { articleID } = req.params;

  try {
    console.log(`Attempting to delete article with ID: ${articleID}`);
    await Article.deleteArticle(articleID);
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: "Error deleting article" });
  }
};

module.exports = {
  getAllArticles,
  searchArticles,
  addArticle,
  removeArticle
};
