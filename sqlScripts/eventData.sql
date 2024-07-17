/* Events Table */
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


INSERT INTO Events (name, description, type, startDate, endDate, createdDate, modifiedDate, imagePath)
VALUES 
	('MET 2024', 'India Largest Exhibition on Materials, Engineering & Technology', 'Exhibition', '2024-06-20', '2024-06-21', GETDATE(), NULL, '\images\events\AluminiumExpo.jpg'),
	('Aluminium Expo', 'Leading aluminium industry tradeshow', 'Misc', '2024-05-2', '2024-05-10', GETDATE(), NULL, '\images\events\FACTECH2024.jpg'),
	('FacTech 2024', 'FACTECH 2023 provides an open platform for people from various backgrounds to express their ideas and develop themselves and their businesses.', 'Misc', '2024-05-1', '2024-05-2', GETDATE(), NULL, '\images\events\GreenVehicleExpo.jpg'),
	('Green Vehicle Expo 2024', ' The Green Vehicle Expo, promoted by the Government of India, serves as a platform for the Made in India and Make in India concepts. ', 'Expo', '2024-05-2', '2024-05-10', GETDATE(), NULL, '\images\events\MET_2024.jpg')

SET IDENTITY_INSERT Users ON;

INSERT INTO Users (userId, username, password, email, role)
VALUES
  (1,'user1', 'password1', 'user1@example.com', 'NormalUser'),
  (2,'user2', 'password2', 'user2@example.com', 'NormalUser'),
  (3,'user3', 'password3', 'user3@example.com', 'NormalUser');


/* EventUsers Table */
CREATE TABLE EventUsers (
    id INT PRIMARY KEY IDENTITY,
    event_id INT,
    user_id INT,
    CONSTRAINT FK_EventUsers_Event FOREIGN KEY (event_id) REFERENCES Events(id),
    CONSTRAINT FK_EventUsers_User FOREIGN KEY (user_id) REFERENCES Users(userId)
);


INSERT INTO EventUsers(event_id, user_id)
VALUES 
(1,1),
(1,2),
(1,3),
(2,1),
(2,2),
(3,1)
