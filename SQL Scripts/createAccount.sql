CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('Organisation', 'Admin', 'NormalUser'))
);

/* do i need username,password and email in Admin if it is already in Users? */
CREATE TABLE Admin (
	id INT PRIMARY KEY IDENTITY,
	user_id INT FOREIGN KEY REFERENCES Users(id) NOT NULL,
	username VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Organisation ( 
	id INT PRIMARY KEY IDENTITY,
	user_id INT FOREIGN KEY REFERENCES Users(id) NOT NULL,
	username VARCHAR(255) NOT NULL UNIQUE,	
	password VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	orgNumber INT NOT NULL UNIQUE, /* ignoring the international code (+65), can? */
);

CREATE TABLE NormalUser (
	id INT PRIMARY KEY IDENTITY,
	user_id INT FOREIGN KEY REFERENCES Users(id) NOT NULL,
	username VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	country VARCHAR(255) NOT NULL,
);