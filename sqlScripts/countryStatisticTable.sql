IF OBJECT_ID('dbo.CountryStatistics', 'U') IS NOT NULL
    DROP TABLE dbo.CountryStatistics;


CREATE TABLE CountryStatistics (
    statisticsID INT PRIMARY KEY IDENTITY(1,1),
    Country VARCHAR(20) not null,
	Category VARCHAR(50) CHECK (Category IN ('Agriculture', 'Services', 'Industry')),
	Year INT NOT NULL,
    Percentage FLOAT null
);