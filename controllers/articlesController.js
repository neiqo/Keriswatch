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
  const { tags, country, author, publisher, title, sector } = req.query;

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
                    WHERE 1 = 1
                  `;    
    const params = [];

    if (tags) {
      params.push(tags);
      sqlQuery += ` AND Tags LIKE '%' + @p${params.length} + '%'`;
    }
    if (country) {
      params.push(country);
      sqlQuery += ` AND Country = @p${params.length}`;
    }
    if (author) {
      params.push(author);
      sqlQuery += ` AND Author = @p${params.length}`;
    }
    if (publisher) {
      params.push(publisher);
      sqlQuery += ` AND Publisher = @p${params.length}`;
    }
    if (title) {
      params.push(title);
      sqlQuery += ` AND Title LIKE '%' + @p${params.length} + '%'`;
    }
    if (sector) {
      params.push(sector);
      sqlQuery += ` AND Sector = @p${params.length}`;
    }

    const request = connection.request();
    params.forEach((param, index) => {
      request.input(`p${index + 1}`, param);
    });

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

