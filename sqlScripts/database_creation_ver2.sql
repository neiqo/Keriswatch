USE bed_db;

-- Drop Foreign Key Constraints if they exist
IF OBJECT_ID('FK_EventUsers_User', 'F') IS NOT NULL
    ALTER TABLE EventUsers DROP CONSTRAINT FK_EventUsers_User;

IF OBJECT_ID('FK_EventUsers_Event', 'F') IS NOT NULL
    ALTER TABLE EventUsers DROP CONSTRAINT FK_EventUsers_Event;

IF OBJECT_ID('FK_Bookmarks_Users', 'F') IS NOT NULL
    ALTER TABLE Bookmarks DROP CONSTRAINT FK_Bookmarks_Users;

IF OBJECT_ID('FK_Bookmarks_Articles', 'F') IS NOT NULL
    ALTER TABLE Bookmarks DROP CONSTRAINT FK_Bookmarks_Articles;

IF OBJECT_ID('FK_ArticleImages_Articles', 'F') IS NOT NULL
    ALTER TABLE ArticleImages DROP CONSTRAINT FK_ArticleImages_Articles;

IF OBJECT_ID('FK_Admin_User', 'F') IS NOT NULL
    ALTER TABLE Admin DROP CONSTRAINT FK_Admin_User;

IF OBJECT_ID('FK_Organisation_User', 'F') IS NOT NULL
    ALTER TABLE Organisation DROP CONSTRAINT FK_Organisation_User;

IF OBJECT_ID('FK_NormalUser_User', 'F') IS NOT NULL
    ALTER TABLE NormalUser DROP CONSTRAINT FK_NormalUser_User;

-- Drop tables
IF OBJECT_ID('dbo.Bookmarks', 'U') IS NOT NULL
    DROP TABLE dbo.Bookmarks;

IF OBJECT_ID('dbo.ArticleImages', 'U') IS NOT NULL
    DROP TABLE dbo.ArticleImages;

IF OBJECT_ID('dbo.Articles', 'U') IS NOT NULL
    DROP TABLE dbo.Articles;

IF OBJECT_ID('dbo.Admin', 'U') IS NOT NULL
    DROP TABLE dbo.Admin;

IF OBJECT_ID('dbo.Organisation', 'U') IS NOT NULL
    DROP TABLE dbo.Organisation;

IF OBJECT_ID('dbo.NormalUser', 'U') IS NOT NULL
    DROP TABLE dbo.NormalUser;

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
    DROP TABLE dbo.Users;

IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL
    DROP TABLE dbo.Events;

IF OBJECT_ID('dbo.EventUsers', 'U') IS NOT NULL
    DROP TABLE dbo.EventUsers;


-- From Diontae
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
    -- Add any Admin-specific columns here if needed
);

CREATE TABLE Organisation (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL UNIQUE,
    orgNumber INT NOT NULL UNIQUE,
    CONSTRAINT FK_Organisation_User FOREIGN KEY (userId) REFERENCES Users(userId)
    -- Add any Org-specific columns here if needed
);

CREATE TABLE NormalUser (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL UNIQUE,
    country VARCHAR(255) NOT NULL,
    CONSTRAINT FK_NormalUser_User FOREIGN KEY (userId) REFERENCES Users(userId)
    -- Add any NormalUser-specific columns here if needed
);


-- From Neil
create table Articles (
	articleId INT PRIMARY KEY IDENTITY(1,1),
	Author VARCHAR(255),
	Publisher VARCHAR(255),
	Country Varchar(255) NOT NULL CHECK (Country IN ('Philippines','Singapore', 'Cambodia', 'Brunei', 'Myanmar', 'Thailand', 'Malaysia', 'Vietnam', 'Indonesia', 'Laos')),
    Sector VARCHAR(255) NOT NULL CHECK (Sector IN ('Manufacture', 'Services', 'Agriculture')),
	Title VARCHAR(255) not null,
	Body TEXT not null,
	publishDateTime DATETIME not null,
    Tags VARCHAR(255)  -- Store tags as a list in C#
);

CREATE INDEX idx_author ON Articles (Author);
CREATE INDEX idx_publisher ON Articles (Publisher);
CREATE INDEX idx_sector ON Articles (Sector);
CREATE INDEX idx_publishDateTime ON Articles (publishDateTime);

-- Table to store images associated with articles
CREATE TABLE ArticleImages (
    ImageID INT PRIMARY KEY IDENTITY(1,1),
    ArticleID INT,
    ImageFileName NVARCHAR(255),
    CONSTRAINT FK_ArticleImages_Articles FOREIGN KEY (ArticleID)
        REFERENCES Articles(articleID)
        ON DELETE CASCADE
);

-- From Sian Kim
CREATE TABLE Bookmarks (
    id INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL,
    articleId INT NOT NULL,
    bookmarkDateTime DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (articleId) REFERENCES Articles(articleId),
    UNIQUE(userId, articleId)
);

CREATE INDEX idx_user_id ON Bookmarks (userId);
CREATE INDEX idx_article_id ON Bookmarks (articleId);
CREATE INDEX idx_bookmarkDateTime ON Bookmarks (bookmarkDateTime);

-- From Vincent
CREATE TABLE Events (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE, 
  description VARCHAR(200) NULL,
  type VARCHAR(10) NULL,
  startDate DATE NULL,
  endDate DATE NULL,
  createdDate DATETIME NULL,
  modifiedDate DATETIME NULL,
  imagePath VARCHAR(255) NULL
);

CREATE TABLE EventUsers (
    id INT PRIMARY KEY IDENTITY,
    event_id INT,
    user_id INT,
    CONSTRAINT FK_EventUsers_Event FOREIGN KEY (event_id) REFERENCES Events(id),
    CONSTRAINT FK_EventUsers_User FOREIGN KEY (user_id) REFERENCES Users(userId)
);

-- Insert Admin Users
INSERT INTO Users (username, password, email, role) VALUES 
('admin1', 'pass1', 'admin1@example.com', 'Admin'),
('admin2', 'pass2', 'admin2@example.com', 'Admin'),
('admin3', 'pass3', 'admin3@example.com', 'Admin'),
('admin4', 'pass4', 'admin4@example.com', 'Admin'),
('admin5', 'pass5', 'admin5@example.com', 'Admin'),
('admin6', 'pass6', 'admin6@example.com', 'Admin'),
('admin7', 'pass7', 'admin7@example.com', 'Admin'),
('admin8', 'pass8', 'admin8@example.com', 'Admin'),
('admin9', 'pass9', 'admin9@example.com', 'Admin'),
('admin10', 'pass10', 'admin10@example.com', 'Admin');

-- Insert into Admin table
INSERT INTO Admin (userId) VALUES 
((SELECT userId FROM Users WHERE username = 'admin1')),
((SELECT userId FROM Users WHERE username = 'admin2')),
((SELECT userId FROM Users WHERE username = 'admin3')),
((SELECT userId FROM Users WHERE username = 'admin4')),
((SELECT userId FROM Users WHERE username = 'admin5')),
((SELECT userId FROM Users WHERE username = 'admin6')),
((SELECT userId FROM Users WHERE username = 'admin7')),
((SELECT userId FROM Users WHERE username = 'admin8')),
((SELECT userId FROM Users WHERE username = 'admin9')),
((SELECT userId FROM Users WHERE username = 'admin10'));

-- Insert Organisation Users
INSERT INTO Users (username, password, email, role) VALUES 
('org1', 'pass1', 'org1@example.com', 'Organisation'),
('org2', 'pass2', 'org2@example.com', 'Organisation'),
('org3', 'pass3', 'org3@example.com', 'Organisation'),
('org4', 'pass4', 'org4@example.com', 'Organisation'),
('org5', 'pass5', 'org5@example.com', 'Organisation'),
('org6', 'pass6', 'org6@example.com', 'Organisation'),
('org7', 'pass7', 'org7@example.com', 'Organisation'),
('org8', 'pass8', 'org8@example.com', 'Organisation'),
('org9', 'pass9', 'org9@example.com', 'Organisation'),
('org10', 'pass10', 'org10@example.com', 'Organisation');

-- Insert into Organisation table
INSERT INTO Organisation (userId, orgNumber) VALUES 
((SELECT userId FROM Users WHERE username = 'org1'), 12345678),
((SELECT userId FROM Users WHERE username = 'org2'), 22345678),
((SELECT userId FROM Users WHERE username = 'org3'), 32345678),
((SELECT userId FROM Users WHERE username = 'org4'), 42345678),
((SELECT userId FROM Users WHERE username = 'org5'), 52345678),
((SELECT userId FROM Users WHERE username = 'org6'), 62345678),
((SELECT userId FROM Users WHERE username = 'org7'), 72345678),
((SELECT userId FROM Users WHERE username = 'org8'), 82345678),
((SELECT userId FROM Users WHERE username = 'org9'), 92345678),
((SELECT userId FROM Users WHERE username = 'org10'), 02345678);

-- Insert Normal Users
INSERT INTO Users (username, password, email, role) VALUES 
('user1', 'pass1', 'user1@example.com', 'NormalUser'),
('user2', 'pass2', 'user2@example.com', 'NormalUser'),
('user3', 'pass3', 'user3@example.com', 'NormalUser'),
('user4', 'pass4', 'user4@example.com', 'NormalUser'),
('user5', 'pass5', 'user5@example.com', 'NormalUser'),
('user6', 'pass6', 'user6@example.com', 'NormalUser'),
('user7', 'pass7', 'user7@example.com', 'NormalUser'),
('user8', 'pass8', 'user8@example.com', 'NormalUser'),
('user9', 'pass9', 'user9@example.com', 'NormalUser'),
('user10', 'pass10', 'user10@example.com', 'NormalUser');

-- Insert into NormalUser table
INSERT INTO NormalUser (userId, country) VALUES 
((SELECT userId FROM Users WHERE username = 'user1'), 'Singapore'),
((SELECT userId FROM Users WHERE username = 'user2'), 'Malaysia'),
((SELECT userId FROM Users WHERE username = 'user3'), 'Indonesia'),
((SELECT userId FROM Users WHERE username = 'user4'), 'Singapore'),
((SELECT userId FROM Users WHERE username = 'user5'), 'Malaysia'),
((SELECT userId FROM Users WHERE username = 'user6'), 'Indonesia'),
((SELECT userId FROM Users WHERE username = 'user7'), 'Singapore'),
((SELECT userId FROM Users WHERE username = 'user8'), 'Malaysia'),
((SELECT userId FROM Users WHERE username = 'user9'), 'Indonesia'),
((SELECT userId FROM Users WHERE username = 'user10'), 'Singapore');

-- Inserting data for Philippines
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('John Smith', 'Publisher A', 'Philippines', 'Manufacture', 'Philippines Manufacturing Article 1', 'Lorem ipsum dolor sit amet.', '2023-05-10 09:00:00', 'technology, innovation'),
('Jane Doe', 'Publisher B', 'Philippines', 'Services', 'Philippines Services Article 1', 'Sed ut perspiciatis unde omnis iste natus error.', '2023-05-12 10:30:00', 'business, finance'),
('Michael Brown', 'Publisher C', 'Philippines', 'Agriculture', 'Philippines Agriculture Article 1', 'Excepteur sint occaecat cupidatat non proident.', '2023-05-15 14:45:00', 'farming, crops');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(1, 'image1.jpg'),
(2, 'image2.jpg'),
(3, 'farm-stay-philippines1.jpg');

-- Inserting data for Singapore
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Emily Johnson', 'Publisher D', 'Singapore', 'Manufacture', 'Singapore Manufacturing Article 1', 'Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', '2023-06-05 11:20:00', 'engineering, production'),
('David Wilson', 'Publisher E', 'Singapore', 'Services', 'Singapore Services Article 1', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', '2023-06-08 09:15:00', 'customer service, support'),
('Sarah Lee', 'Publisher F', 'Singapore', 'Agriculture', 'Singapore Agriculture Article 1', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', '2023-06-10 15:00:00', 'agricultural practices');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(4, 'image4.jpg'),
(5, 'image5.jpg'),
(6, 'image6.jpg');

-- Inserting data for Cambodia
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Mark Thompson', 'Publisher G', 'Cambodia', 'Manufacture', 'Cambodia Manufacturing Article 1', 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.', '2023-07-02 08:45:00', 'industry, development'),
('Sophia Brown', 'Publisher H', 'Cambodia', 'Services', 'Cambodia Services Article 1', 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.', '2023-07-05 12:00:00', 'business growth, economy'),
('Daniel Tan', 'Publisher I', 'Cambodia', 'Agriculture', 'Cambodia Agriculture Article 1', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', '2023-07-08 13:30:00', 'farming techniques, crop management');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(7, 'image7.jpg'),
(8, 'image8.jpg');

-- Inserting data for Brunei
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Liam Wong', 'Publisher J', 'Brunei', 'Manufacture', 'Brunei Manufacturing Article 1', 'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', '2023-07-15 10:00:00', 'innovation, technology'),
('Ella Lim', 'Publisher K', 'Brunei', 'Services', 'Brunei Services Article 1', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', '2023-07-18 11:45:00', 'customer service, support'),
('Noah Goh', 'Publisher L', 'Brunei', 'Agriculture', 'Brunei Agriculture Article 1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2023-07-20 14:00:00', 'farming, agriculture');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(9, 'image9.jpg'),
(10, 'image10.jpg'),
(11, 'image11.jpg');

-- Inserting data for Myanmar
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Oliver Tan', 'Publisher M', 'Myanmar', 'Manufacture', 'Myanmar Manufacturing Article 1', 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.', '2023-08-05 09:30:00', 'industry, development'),
('Ava Ng', 'Publisher N', 'Myanmar', 'Services', 'Myanmar Services Article 1', 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.', '2023-08-08 12:15:00', 'business growth, economy'),
('Leo Yap', 'Publisher O', 'Myanmar', 'Agriculture', 'Myanmar Agriculture Article 1', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', '2023-08-10 14:45:00', 'farming techniques, crop management');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(12, 'image12.jpg'),
(13, 'image13.jpg'),
(14, 'image14.jpg');

-- Inserting data for Thailand
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Sophie Koh', 'Publisher P', 'Thailand', 'Manufacture', 'Thailand Manufacturing Article 1', 'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', '2023-09-05 10:30:00', 'innovation, technology'),
('Jack Tan', 'Publisher Q', 'Thailand', 'Services', 'Thailand Services Article 1', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', '2023-09-08 12:45:00', 'customer service, support'),
('Chloe Lim', 'Publisher R', 'Thailand', 'Agriculture', 'Thailand Agriculture Article 1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2023-09-10 15:00:00', 'farming, agriculture');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(15, 'image15.jpg'),
(16, 'image16.jpg');

-- Inserting data for Malaysia
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Max Goh', 'Publisher S', 'Malaysia', 'Manufacture', 'Malaysia Manufacturing Article 1', 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.', '2023-10-05 09:00:00', 'industry, development'),
('Eva Lee', 'Publisher T', 'Malaysia', 'Services', 'Malaysia Services Article 1', 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.', '2023-10-08 10:30:00', 'business growth, economy'),
('James Wong', 'Publisher U', 'Malaysia', 'Agriculture', 'Malaysia Agriculture Article 1', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', '2023-10-10 14:45:00', 'farming techniques, crop management');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(17, 'image17.jpg'),
(18, 'image18.jpg'),
(19, 'image19.jpg'),
(20, 'image20.jpg');

-- Inserting data for Vietnam
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Lily Tran', 'Publisher V', 'Vietnam', 'Manufacture', 'Vietnam Manufacturing Article 1', 'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', '2023-11-05 11:00:00', 'innovation, technology'),
('Ryan Nguyen', 'Publisher W', 'Vietnam', 'Services', 'Vietnam Services Article 1', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', '2023-11-08 13:15:00', 'customer service, support'),
('Sophia Tran', 'Publisher X', 'Vietnam', 'Agriculture', 'Vietnam Agriculture Article 1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2023-11-10 16:30:00', 'farming, agriculture');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(21, 'image21.jpg'),
(22, 'image22.jpg'),
(23, 'image23.jpg');

-- Inserting data for Indonesia
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Adam Wijaya', 'Publisher Y', 'Indonesia', 'Manufacture', 'Indonesia Manufacturing Article 1', 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.', '2023-12-05 09:45:00', 'industry, development'),
('Sarah Indra', 'Publisher Z', 'Indonesia', 'Services', 'Indonesia Services Article 1', 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.', '2023-12-08 11:00:00', 'business growth, economy'),
('David Setiawan', 'Publisher AA', 'Indonesia', 'Agriculture', 'Indonesia Agriculture Article 1', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', '2023-12-10 13:30:00', 'farming techniques, crop management');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(24, 'image24.jpg'),
(25, 'image25.jpg'),
(26, 'image26.jpg');

-- Inserting data for Laos
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Sophie Pham', 'Publisher AB', 'Laos', 'Manufacture', 'Laos Manufacturing Article 1', 'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', '2024-01-05 10:00:00', 'innovation, technology'),
('Jackie Vong', 'Publisher AC', 'Laos', 'Services', 'Laos Services Article 1', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', '2024-01-08 12:15:00', 'customer service, support'),
('Daniel Kham', 'Publisher AD', 'Laos', 'Agriculture', 'Laos Agriculture Article 1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2024-01-10 14:30:00', 'farming, agriculture');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(27, 'image27.jpg'),
(28, 'image28.jpg'),
(29, 'image29.jpg');

-- Inserting bookmark values into the database
INSERT INTO Bookmarks (userId, articleId)
VALUES (1, 5),
(1, 6),
(1, 11),
(7, 5),
(7, 3),
(8, 3),
(9, 4);

-- Inserting data for Events

INSERT INTO Events (name, description, type, startDate, endDate, createdDate, modifiedDate, imagePath)
VALUES 
	('MET 2024', 'India Largest Exhibition on Materials, Engineering & Technology', 'Exhibition', '2024-06-20', '2024-06-21', GETDATE(), NULL, '\images\events\AluminiumExpo.jpg'),
	('Aluminium Expo', 'Leading aluminium industry tradeshow', 'Misc', '2024-05-2', '2024-05-10', GETDATE(), NULL, '\images\events\FACTECH2024.jpg'),
	('FacTech 2024', 'FACTECH 2023 provides an open platform for people from various backgrounds to express their ideas and develop themselves and their businesses.', 'Misc', '2024-05-1', '2024-05-2', GETDATE(), NULL, '\images\events\GreenVehicleExpo.jpg'),
	('Green Vehicle Expo 2024', ' The Green Vehicle Expo, promoted by the Government of India, serves as a platform for the Made in India and Make in India concepts. ', 'Expo', '2024-05-2', '2024-05-10', GETDATE(), NULL, '\images\events\MET_2024.jpg');

-- Inserting data for EventUsers
INSERT INTO EventUsers(event_id, user_id)
VALUES 
(1,1),
(1,2),
(1,3),
(2,1),
(2,2),
(3,1);