-- Insert 5 articles into the Articles table
INSERT INTO Articles (Author, Publisher, Sector, Title, Body, publishDateTime, Tags)
VALUES
('John Doe', 'Publisher A', 'Manufacture', 'Article 1', 'Lorem ipsum dolor sit amet.', '2024-06-17 08:00:00', 'technology, innovation'),
('Jane Smith', 'Publisher B', 'Services', 'Article 2', 'Sed ut perspiciatis unde omnis iste natus error.', '2024-06-16 10:30:00', 'business, finance'),
('Michael Brown', 'Publisher C', 'Agriculture', 'Article 3', 'Excepteur sint occaecat cupidatat non proident.', '2024-06-15 14:45:00', 'farming, crops'),
('Emily Johnson', 'Publisher D', 'Manufacture', 'Article 4', 'Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', '2024-06-14 11:20:00', 'engineering, production'),
('David Wilson', 'Publisher E', 'Services', 'Article 5', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.', '2024-06-13 09:15:00', 'customer service, support');

-- Assuming each article ID (articleID) starts from 1 and increments automatically (due to IDENTITY)

-- Insert 3 fake image filenames for each article into the ArticleImages table
-- Replace the articleID values with the actual IDs generated after inserting articles

-- For Article 1 (articleID = 1)
INSERT INTO ArticleImages (ArticleID, ImageFilename)
VALUES
(1, 'image1.jpg'),
(1, 'image2.jpg'),
(1, 'image3.jpg');

-- For Article 2 (articleID = 2)
INSERT INTO ArticleImages (ArticleID, ImageFilename)
VALUES
(2, 'image1.jpg'),
(2, 'image2.jpg'),
(2, 'image3.jpg');

-- For Article 3 (articleID = 3)
INSERT INTO ArticleImages (ArticleID, ImageFilename)
VALUES
(3, 'farm-stay-philippines1.jpg'),
(3, 'image2.jpg'),
(3, 'image3.jpg');

-- For Article 4 (articleID = 4)
INSERT INTO ArticleImages (ArticleID, ImageFilename)
VALUES
(4, 'image1.jpg'),
(4, 'image2.jpg'),
(4, 'image3.jpg');

-- For Article 5 (articleID = 5)
INSERT INTO ArticleImages (ArticleID, ImageFilename)
VALUES
(5, 'image1.jpg'),
(5, 'image2.jpg'),
(5, 'image3.jpg');
