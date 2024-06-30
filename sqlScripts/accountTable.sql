IF OBJECT_ID('dbo.NormalUser', 'U') IS NOT NULL
    DROP TABLE dbo.NormalUser;

IF OBJECT_ID('dbo.Organisation', 'U') IS NOT NULL
    DROP TABLE dbo.Organisation;

IF OBJECT_ID('dbo.Admin', 'U') IS NOT NULL
    DROP TABLE dbo.Admin;

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;

CREATE TABLE Users (
    userId INT PRIMARY KEY IDENTITY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('Organisation', 'Admin', 'NormalUser'))
);

CREATE TABLE Admin (
    id INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(userId)
    -- Add any Admin-specific columns here if needed
);

CREATE TABLE Organisation (
    id INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(userId),
    orgNumber INT NOT NULL UNIQUE
    -- Add any Org-specific columns here if needed
);

CREATE TABLE NormalUser (
    id INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(userId)
    -- Add any NormalUser-specific columns here if needed
);
