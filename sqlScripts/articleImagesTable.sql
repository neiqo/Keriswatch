USE bed_db;

-- Table to store images associated with articles
CREATE TABLE ArticleImages (
    ImageID INT PRIMARY KEY IDENTITY(1,1),
    ArticleID INT,
    ImageFileName NVARCHAR(255),
    CONSTRAINT FK_ArticleImages_Articles FOREIGN KEY (ArticleID)
        REFERENCES Articles(articleID)
        ON DELETE CASCADE
);
