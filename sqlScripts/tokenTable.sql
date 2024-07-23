USE bed_db;

IF OBJECT_ID('dbo.Tokens', 'U') IS NOT NULL
    DROP TABLE dbo.Tokens;

CREATE TABLE Tokens (
    tokenId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    token VARCHAR(MAX) NOT NULL,
    expiresAt DATETIME NOT NULL,
    CONSTRAINT FK_Token_User FOREIGN KEY (userId) REFERENCES Users(userId)
);
