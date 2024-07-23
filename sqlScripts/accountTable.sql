use bed_db;

IF OBJECT_ID('dbo.NormalUser', 'U') IS NOT NULL
    DROP TABLE dbo.NormalUser;

IF OBJECT_ID('dbo.Organisation', 'U') IS NOT NULL
    DROP TABLE dbo.Organisation;

IF OBJECT_ID('dbo.Admin', 'U') IS NOT NULL
    DROP TABLE dbo.Admin;

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;

CREATE TABLE Users (
    userId INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('Organisation', 'Admin', 'NormalUser')),
    profilePicture VARCHAR(255) NOT NULL DEFAULT 'defaultProfile.png'
);

CREATE TABLE Admin (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL UNIQUE,
    CONSTRAINT FK_Admin_User FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE Organisation (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL UNIQUE,
    orgNumber INT NOT NULL UNIQUE,
    CONSTRAINT FK_Organisation_User FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE NormalUser (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL UNIQUE,
    country VARCHAR(255) NOT NULL,
    CONSTRAINT FK_NormalUser_User FOREIGN KEY (userId) REFERENCES Users(userId)
);

