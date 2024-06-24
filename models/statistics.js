const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Statistics {
    static async getStatisticsByCountryAndYear(country, year) {
        try {
            const connection = await sql.connect(dbConfig);
            const request = connection.request();
            
            request.input('country', sql.VarChar, country);
            request.input('year', sql.Int, year);
            const result = await request.query(`
                SELECT Category, Percentage
                FROM CountryStatistics
                WHERE Country = @country AND Year = @year
            `);

            connection.close();
            return result.recordset;
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = Statistics;
