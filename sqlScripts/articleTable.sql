USE bed_db;

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