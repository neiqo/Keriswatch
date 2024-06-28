CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('Organisation', 'Admin', 'NormalUser'))
);

CREATE TABLE Admin (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(id)
    -- Add any Admin-specific columns here if needed
);

CREATE TABLE Organisation (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(id),
    orgNumber INT NOT NULL UNIQUE
    -- Add any Organisation-specific columns here if needed
);

CREATE TABLE NormalUser (
    id INT PRIMARY KEY IDENTITY,
    user_id INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Users(id)
    -- Add any NormalUser-specific columns here if needed
);
