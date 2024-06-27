IF OBJECT_ID('dbo.CountryStatistics', 'U') IS NOT NULL
    DROP TABLE dbo.CountryStatistics;

CREATE TABLE CountryStatistics (
    statisticsID INT PRIMARY KEY IDENTITY(1,1),
    country Varchar(255) NOT NULL CHECK (Country IN ('Philippines','Singapore', 'Cambodia', 'Brunei', 'Myanmar', 'Thailand', 'Malaysia', 'Vietnam', 'Indonesia', 'Laos')),
	category VARCHAR(50) NOT NULL CHECK (Category IN ('Agriculture', 'Services', 'Industry')),
	year INT NOT NULL,
    percentage FLOAT null
);