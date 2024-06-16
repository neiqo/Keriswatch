const Article = require("../models/articles");
const sql = require("mssql");
const dbConfig = require("../dbConfig");

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


module.exports = {
  getAllArticles,
  searchArticles
};

