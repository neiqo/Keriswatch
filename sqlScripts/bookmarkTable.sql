CREATE TABLE Bookmarks (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    bookmarkDateTime DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (article_id) REFERENCES Articles(articleId),
    UNIQUE(user_id, article_id)
);

CREATE INDEX idx_user_id ON Bookmarks (user_id);
CREATE INDEX idx_article_id ON Bookmarks (article_id);
CREATE INDEX idx_bookmarkDateTime ON Bookmarks (bookmarkDateTime);
