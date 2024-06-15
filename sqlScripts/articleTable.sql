USE bed_db;

create table Articles (
	articleId INT PRIMARY KEY IDENTITY(1,1),
	Author VARCHAR(255),
	Publisher VARCHAR(255),
	Title VARCHAR(255) not null,
	Body TEXT not null,
	publishDateTime DATETIME not null,
);

CREATE INDEX idx_author ON Articles (Author);
CREATE INDEX idx_publisher ON Articles (Publisher);
CREATE INDEX idx_publishDateTime ON Articles (publishDateTime);