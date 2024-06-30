const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Statistic {
  constructor(statisticsID, country, category, year, percentage) {
    this.statisticsID = statisticsID;
    this.country = country;
    this.category = category;
    this.year = year;
    this.percentage = percentage;
  }

  static async getAllStatistics() {
    const connection = await sql.connect(dbConfig);
    
    const sqlQuery = `SELECT * FROM CountryStatistics`;
    
    const request = connection.request();
    const result = await request.query(sqlQuery);
    
    connection.close();
    
    return result.recordset.map(
      (row) => new Statistic(row.statisticsID, row.country, row.category, row.year, row.percentage)
    );
  }

  static async getStatisticsByCountry(country) {
    const connection = await sql.connect(dbConfig);
    
    const sqlQuery = `SELECT * FROM CountryStatistics WHERE country = @country AND year = '2022'`; // Parameterized query
    
    const request = connection.request();
    request.input('country', sql.VarChar, country);
    const result = await request.query(sqlQuery);
    
    connection.close();
    
    return result.recordset.map((row) => new Statistic(
      row.statisticsID,
      row.country,
      row.category,
      row.year,
      row.percentage
    ));
  }
}

module.exports = Statistic;