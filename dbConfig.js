module.exports = {
    user: "booksapi-user", // Replace with your SQL Server login username
    password: "password", // Replace with your SQL Server login password
    server: "SQLEXPRESS02",
    database: "bed_db",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
};

// to be changed