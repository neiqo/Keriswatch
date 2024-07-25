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

IF OBJECT_ID('dbo.Tokens', 'U') IS NOT NULL
    DROP TABLE dbo.Tokens;

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

CREATE TABLE Tokens (
    tokenId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    token VARCHAR(MAX) NOT NULL,
    expiresAt DATETIME NOT NULL,
    CONSTRAINT FK_Token_User FOREIGN KEY (userId) REFERENCES Users(userId)
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

-- From Diontae
-- Create Comments table
CREATE TABLE Comments (
    commentId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    articleId INT NOT NULL,
    content TEXT NOT NULL,
    parentId INT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    CONSTRAINT FK_Comments_User FOREIGN KEY (userId) REFERENCES Users(userId),
    CONSTRAINT FK_Comments_Article FOREIGN KEY (articleId) REFERENCES Articles(articleId),
    CONSTRAINT FK_Comments_Parent FOREIGN KEY (parentId) REFERENCES Comments(commentId)
);

-- Create Upvotes table
CREATE TABLE Upvotes (
    upvoteId INT IDENTITY(1,1) PRIMARY KEY,
    commentId INT NOT NULL,
    userId INT NOT NULL,
    CONSTRAINT FK_Upvotes_Comment FOREIGN KEY (commentId) REFERENCES Comments(commentId),
    CONSTRAINT FK_Upvotes_User FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- Create Downvotes table
CREATE TABLE Downvotes (
    downvoteId INT IDENTITY(1,1) PRIMARY KEY,
    commentId INT NOT NULL,
    userId INT NOT NULL,
    CONSTRAINT FK_Downvotes_Comment FOREIGN KEY (commentId) REFERENCES Comments(commentId),
    CONSTRAINT FK_Downvotes_User FOREIGN KEY (userId) REFERENCES Users(userId)
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
('John Smith', 'Philippine Daily', 'Philippines', 'Manufacture', 'Advancements in Philippine Manufacturing Technology', 
'The Philippine manufacturing sector is currently experiencing a transformative phase, driven by rapid technological advancements and innovative practices. As the industry adapts to global demands, the adoption of Industry 4.0 technologies such as automation, artificial intelligence, and the Internet of Things (IoT) is becoming increasingly prevalent. These technologies are revolutionizing production processes, making them more efficient and cost-effective.

The shift towards automation is enabling manufacturers to streamline their operations, reduce human error, and enhance product quality. Robotics and AI are being integrated into assembly lines, while IoT devices provide real-time data that helps in predictive maintenance and process optimization. This technological integration is not only improving productivity but also providing manufacturers with valuable insights that drive strategic decision-making.

Moreover, the Philippine government has been actively supporting this transformation through various initiatives, including tax incentives for technology investments and partnerships with educational institutions to foster a skilled workforce. These efforts are aimed at creating a robust manufacturing ecosystem capable of competing on a global scale.

In addition to technological advancements, there is a growing emphasis on sustainable manufacturing practices. Companies are increasingly adopting eco-friendly processes and materials to minimize their environmental impact. This shift towards sustainability is driven by both regulatory requirements and a growing awareness of environmental issues among consumers. The combination of technological innovation and sustainability is setting the stage for a dynamic and forward-looking manufacturing sector in the Philippines.', 
'2023-05-10 09:00:00', 'technology, innovation'),

('Jane Doe', 'Business Times PH', 'Philippines', 'Services', 'Growth Trends in Philippine Services Sector', 
'The services sector in the Philippines has been experiencing remarkable growth, driven by both domestic and international factors. The sector encompasses a wide range of industries, including business process outsourcing (BPO), financial services, and hospitality. This growth is attributed to several key factors, including the country�s skilled workforce, favorable business environment, and increasing demand for service-based solutions.

The BPO industry, in particular, has seen significant expansion due to the availability of a highly educated and English-speaking workforce. Companies are increasingly outsourcing various functions such as customer support, IT services, and finance to the Philippines, leveraging cost efficiencies and expertise. This trend has led to the establishment of numerous BPO hubs across the country, contributing to job creation and economic growth.

In addition to the BPO sector, financial services are also experiencing a surge in demand. The rise of fintech innovations, such as mobile banking and digital payment solutions, is reshaping the financial landscape. These advancements are improving financial inclusion and providing more convenient and accessible financial services to the population.

The Philippine government has been proactive in supporting the growth of the services sector by implementing policies that promote investment and streamline regulatory processes. Initiatives such as infrastructure development, tax incentives, and support for startups are creating a conducive environment for the expansion of service-based industries. As the sector continues to evolve, it is poised to play a crucial role in the country�s economic development and global competitiveness.', 
'2023-05-12 10:30:00', 'business, finance'),

('Michael Brown', 'AgriPhil', 'Philippines', 'Agriculture', 'The Future of Agriculture in the Philippines', 
'Agriculture in the Philippines is undergoing a significant transformation, driven by technological advancements and a renewed focus on sustainability. Traditional farming practices are being complemented by modern techniques that aim to enhance productivity, improve soil health, and ensure food security.

One of the key innovations in Philippine agriculture is the use of precision farming technologies. These technologies include GPS-guided equipment, sensors, and drones that provide real-time data on crop conditions, soil quality, and weather patterns. By leveraging this data, farmers can make informed decisions about planting, irrigation, and fertilization, leading to more efficient use of resources and higher crop yields.

Additionally, there is a growing emphasis on sustainable agricultural practices. The introduction of organic farming methods, integrated pest management, and soil conservation techniques is helping to reduce the environmental impact of agriculture. These practices are not only beneficial for the environment but also contribute to the production of healthier food.

The Philippine government and various organizations are actively supporting these advancements through research and development programs, training workshops, and financial assistance. These efforts aim to equip farmers with the knowledge and tools needed to adapt to changing agricultural conditions and market demands.

Furthermore, the rise of urban agriculture is providing new opportunities for local food production. Urban farms and community gardens are becoming increasingly popular, allowing city dwellers to grow their own produce and contribute to food security. The combination of technological innovation, sustainability, and community engagement is shaping the future of agriculture in the Philippines, ensuring a more resilient and productive sector.', 
'2023-05-15 14:45:00', 'farming, crops');


-- Inserting data for Singapore
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Emily Johnson', 'Tech Review Singapore', 'Singapore', 'Manufacture', 'Singapore�s Manufacturing Sector Embraces Innovative Techniques', 
'In recent years, Singapore has experienced a significant transformation in its manufacturing sector. Leading companies are adopting advanced technologies such as automation, robotics, and artificial intelligence to streamline production processes. This shift towards high-tech manufacturing not only improves efficiency but also ensures higher quality standards. Automation systems and robotics are now commonplace on factory floors, allowing for real-time monitoring, predictive maintenance, and enhanced precision in production tasks. The integration of artificial intelligence into manufacturing processes aids in optimizing workflows, reducing waste, and forecasting demand more accurately. Additionally, Singapore�s commitment to research and development is driving continuous innovation in the industry. By investing in cutting-edge practices, Singapore is not only reinforcing its position as a global manufacturing hub but also setting new standards in the sector. The country�s focus on high-tech manufacturing is attracting international investments and fostering partnerships with global technology leaders. This progressive approach is paving the way for a new era in manufacturing, characterized by smart factories, increased automation, and sustainable practices. As Singapore continues to evolve and embrace these advancements, it is well-positioned to lead the way in shaping the future of the global manufacturing landscape.', 
'2023-06-05 11:20:00', 'innovation, technology'),

('David Wilson', 'Business Times Singapore', 'Singapore', 'Services', 'Enhancing Customer Experience in Singapore�s Service Sector', 
'The service sector in Singapore has seen remarkable advancements in recent years, driven by a focus on enhancing customer experience. Businesses across various industries are increasingly leveraging digital tools and technologies to provide more personalized and efficient services. Innovations such as artificial intelligence, chatbots, and data analytics are being used to better understand customer preferences and improve service delivery. AI-driven customer service platforms enable real-time interactions and support, while data analytics helps companies anticipate customer needs and tailor their offerings accordingly. Additionally, the adoption of omnichannel strategies ensures a seamless customer journey across different touchpoints, from online interactions to in-person services. Singapore�s emphasis on service excellence is also evident in its efforts to train and upskill the workforce, ensuring that employees are equipped to deliver top-notch service. This commitment to customer-centric approaches is not only enhancing customer satisfaction but also fostering long-term loyalty and driving business growth. As the service sector continues to evolve, Singapore is setting new benchmarks for customer experience and establishing itself as a leader in service innovation. The integration of digital technologies and a focus on continuous improvement are key factors contributing to the sector�s success and its role in the country�s economic development.', 
'2023-06-08 09:15:00', 'customer experience, digital transformation'),

('Sarah Lee', 'Green Future Singapore', 'Singapore', 'Agriculture', 'Revolutionizing Agriculture: Urban Farming Trends in Singapore', 
'Urban farming has become a prominent trend in Singapore�s agricultural sector, driven by the need for sustainable food production in limited urban spaces. With innovative techniques such as vertical farming, hydroponics, and aeroponics, Singapore is transforming its approach to agriculture. Vertical farming involves growing crops in stacked layers, which maximizes space and allows for year-round production. Hydroponics and aeroponics are soil-free methods that use nutrient-rich water solutions to nourish plants, leading to faster growth and higher yields. These methods also reduce the environmental impact associated with traditional farming, such as soil degradation and water waste. Urban farms are often integrated into cityscapes, utilizing rooftops, abandoned buildings, and community spaces. This not only enhances local food security but also contributes to greener, more sustainable urban environments. By promoting urban farming, Singapore is addressing the challenges of food sustainability and supply chain resilience. The government and private sector are investing in research and development to further advance these practices, aiming to create a more self-sufficient food system. Through these initiatives, Singapore is setting a global example in sustainable agriculture and contributing to broader efforts in environmental conservation and food security. The integration of innovative farming techniques into urban planning represents a significant step towards a more resilient and sustainable future for the country.', 
'2023-06-12 08:45:00', 'sustainability, urban farming');


-- Inserting data for Cambodia
-- Inserting data for Cambodia
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Mark Thompson', 'Cambodia Industrial Journal', 'Cambodia', 'Manufacture', 'Cambodia�s Manufacturing Sector: Adapting to Global Trends', 
'Cambodia�s manufacturing sector is undergoing a significant transformation as it adapts to global trends and technological advancements. Over the past decade, the country has positioned itself as an attractive destination for manufacturing investments, particularly in the textile and garment industries. Companies are increasingly embracing automation and modern production techniques to enhance efficiency and competitiveness. The integration of advanced machinery and robotics has led to higher productivity and improved quality control. Moreover, Cambodian manufacturers are focusing on sustainability and ethical practices, responding to growing consumer demand for environmentally friendly products. Initiatives such as energy-efficient production processes and waste reduction strategies are being implemented to minimize the sector�s environmental impact. The Cambodian government is also playing a crucial role in supporting the industry by investing in infrastructure and providing incentives for businesses that adopt sustainable practices. These efforts are not only strengthening the country�s manufacturing capabilities but also positioning Cambodia as a key player in the global supply chain. As the sector continues to evolve, it is expected to drive economic growth and create new job opportunities, contributing to the overall development of the country.', 
'2023-07-02 08:45:00', 'technology, sustainability'),

('Sophia Brown', 'Cambodia Business Review', 'Cambodia', 'Services', 'Expanding Horizons: Growth of the Service Sector in Cambodia', 
'Cambodia�s service sector has experienced remarkable growth in recent years, driven by increasing consumer demand and investment in infrastructure. The sector encompasses a wide range of industries, including tourism, finance, and healthcare, each contributing to the country�s economic development. The rise in tourism has been a major factor, with Cambodia�s rich cultural heritage and natural attractions drawing visitors from around the world. This growth has led to an expansion of hospitality services and related businesses, creating new opportunities for local entrepreneurs. Additionally, the financial services sector is evolving with the introduction of digital banking and fintech solutions, enhancing accessibility and convenience for consumers. The healthcare sector is also advancing, with investments in medical facilities and services improving healthcare access and quality. The Cambodian government is actively supporting the service sector through various initiatives, including infrastructure development and regulatory reforms. These efforts are aimed at fostering a competitive business environment and attracting foreign investment. As the service sector continues to expand, it is expected to play a crucial role in driving economic growth and improving the quality of life for Cambodians.', 
'2023-07-05 12:00:00', 'tourism, finance'),

('Daniel Tan', 'Cambodia Agricultural Times', 'Cambodia', 'Agriculture', 'Advancements in Cambodian Agriculture: Embracing Modern Techniques', 
'Cambodia�s agricultural sector is embracing modern techniques to enhance productivity and sustainability. Traditional farming practices are being complemented by innovative approaches such as precision agriculture and smart irrigation systems. Precision agriculture involves the use of technology, such as GPS and sensors, to optimize field management and resource use. This method allows farmers to monitor crop health and soil conditions in real time, leading to more informed decisions and increased yields. Smart irrigation systems, which utilize data on weather conditions and soil moisture levels, help to conserve water and improve crop growth. Additionally, the Cambodian government and various organizations are investing in research and development to support these advancements. Training programs and resources are being provided to farmers to help them adapt to new technologies and practices. The focus on modernization is also aimed at addressing challenges such as climate change and resource scarcity. By integrating modern techniques into agricultural practices, Cambodia is working towards a more resilient and sustainable food system. These efforts are expected to improve food security, support rural livelihoods, and contribute to the country�s overall economic development.', 
'2023-07-08 13:30:00', 'precision agriculture, sustainability');


-- Inserting data for Brunei
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Liam Wong', 'Brunei Manufacturing Daily', 'Brunei', 'Manufacture', 'Brunei�s Manufacturing Sector: Innovations and Challenges', 
'Brunei�s manufacturing sector is experiencing a period of transformation as the country seeks to diversify its economy away from oil and gas dependence. Recent developments in the sector highlight the country�s commitment to embracing innovation and technology. Local manufacturers are investing in advanced machinery and automation to enhance production efficiency and product quality. The focus is on modernizing traditional industries such as electronics and textiles, while also exploring new areas like aerospace and biotechnology. Despite these advancements, the sector faces challenges such as a limited skilled workforce and competition from regional markets. To address these issues, the Brunei government is implementing policies to support industrial growth, including incentives for businesses that invest in research and development. Additionally, there are efforts to improve workforce training and attract foreign expertise. By leveraging technological advancements and fostering a conducive business environment, Brunei aims to establish itself as a competitive player in the global manufacturing arena while contributing to the country�s economic diversification goals.', 
'2023-07-15 10:00:00', 'innovation, technology'),

('Ella Lim', 'Brunei Services Review', 'Brunei', 'Services', 'The Evolution of Brunei�s Service Industry: Trends and Opportunities', 
'Brunei�s service industry is rapidly evolving, driven by technological advancements and changing consumer preferences. The sector, which includes tourism, finance, and healthcare, has become a crucial component of the country�s economy. Tourism, in particular, is seeing significant growth, with Brunei�s unique cultural heritage and natural beauty attracting international visitors. This growth is prompting investments in hospitality infrastructure and related services. The financial services sector is also advancing, with the rise of digital banking and fintech solutions enhancing accessibility and efficiency. In healthcare, there is a focus on improving medical facilities and services to meet the growing demand for quality care. The Brunei government is supporting these developments through strategic initiatives aimed at fostering a vibrant service sector. These include policies to promote innovation, improve service quality, and attract investment. As the sector continues to expand, it is expected to play a key role in driving economic growth and enhancing the quality of life for Bruneians.', 
'2023-07-18 11:45:00', 'tourism, finance'),

('Noah Goh', 'Brunei Agricultural Journal', 'Brunei', 'Agriculture', 'Advancing Agricultural Practices in Brunei: A Focus on Sustainability', 
'Brunei�s agricultural sector is undergoing a significant transformation with an emphasis on sustainable practices and modern techniques. Traditionally reliant on subsistence farming, the sector is now incorporating innovative methods to increase productivity and environmental stewardship. Techniques such as hydroponics and vertical farming are being adopted to maximize space and resource use, especially in urban areas. The government is also investing in research and development to promote sustainable agricultural practices and improve food security. Programs aimed at training farmers in modern techniques and providing access to advanced tools and technologies are helping to drive these changes. Additionally, there is a push towards organic farming and reducing the environmental impact of agricultural activities. By focusing on sustainability and efficiency, Brunei is working to build a resilient agricultural sector that can support the country�s long-term food needs while contributing to broader environmental goals.', 
'2023-07-20 14:00:00', 'sustainability, modern techniques');

-- Inserting data for Myanmar
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Oliver Tan', 'Myanmar Industrial Times', 'Myanmar', 'Manufacture', 'Myanmar�s Manufacturing Sector: Opportunities and Challenges', 
'Myanmar�s manufacturing sector is at a pivotal moment, with increasing foreign investment and a growing focus on industrial development. The country�s strategic location and abundant natural resources present significant opportunities for growth. Local manufacturers are adopting new technologies and improving production processes to enhance competitiveness. Key industries, such as textiles and electronics, are expanding as Myanmar positions itself as a viable alternative to other manufacturing hubs in Asia. However, the sector faces challenges including infrastructure deficits, regulatory hurdles, and the need for skilled labor. The Myanmar government is actively working to address these issues by implementing reforms to streamline business operations and investing in infrastructure projects. By fostering a supportive environment for industrial growth and attracting foreign direct investment, Myanmar aims to strengthen its manufacturing sector and contribute to overall economic development.', 
'2023-08-05 09:30:00', 'industry, investment'),

('Ava Ng', 'Myanmar Business Weekly', 'Myanmar', 'Services', 'Growing Service Sector in Myanmar: Trends and Impacts', 
'Myanmar�s service sector is expanding rapidly, driven by economic reforms and increased consumer demand. The sector encompasses various industries, including retail, hospitality, and finance, each contributing to the country�s economic development. The rise in disposable income and urbanization has spurred growth in the retail and hospitality sectors, with new businesses and services emerging to cater to evolving consumer preferences. In finance, the adoption of digital banking and fintech solutions is enhancing financial inclusion and accessibility. The Myanmar government is supporting the service sector through initiatives aimed at improving infrastructure, regulatory frameworks, and business environments. These efforts are designed to stimulate growth, attract investment, and create job opportunities. As the sector continues to evolve, it is expected to play a crucial role in Myanmar�s economic transformation and development.', 
'2023-08-08 12:15:00', 'finance, retail'),

('Leo Yap', 'Myanmar Agricultural Review', 'Myanmar', 'Agriculture', 'Myanmar Agriculture: Embracing Modern Techniques for Growth', 
'Myanmar�s agricultural sector is embracing modern techniques to enhance productivity and sustainability. Traditionally reliant on manual farming methods, the sector is now integrating advanced technologies such as precision agriculture and smart irrigation systems. These innovations help farmers optimize resource use, improve crop yields, and manage pests more effectively. The government is supporting these advancements through research and development initiatives and providing training programs for farmers. Additionally, there is a focus on sustainable practices, such as organic farming and conservation tillage, to address environmental concerns and improve soil health. The adoption of these modern techniques is expected to boost agricultural output, support rural livelihoods, and contribute to the country�s overall economic growth. By investing in technology and sustainability, Myanmar aims to build a more resilient and efficient agricultural sector.', 
'2023-08-10 14:45:00', 'precision agriculture, sustainability');


-- Inserting data for Thailand
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Sophie Koh', 'Thailand Manufacturing Monthly', 'Thailand', 'Manufacture', 'Thailand�s Manufacturing Sector: A Beacon of Innovation and Growth', 
'Thailand�s manufacturing sector is rapidly evolving, driven by technological advancements and strategic initiatives aimed at boosting productivity and global competitiveness. The country has established itself as a major player in industries such as automotive, electronics, and textiles. Recent investments in automation and smart technologies are revolutionizing production processes, making Thai manufacturers more efficient and adaptive to market demands. Additionally, the government is supporting the sector through policies that encourage innovation and technology adoption. This includes providing incentives for research and development and facilitating partnerships between local firms and international tech companies. Despite these positive developments, the sector faces challenges, including a need for skilled labor and competition from neighboring countries. To address these issues, Thailand is focusing on improving education and training programs to equip the workforce with the skills needed for the evolving industrial landscape. By leveraging its strengths and addressing its challenges, Thailand aims to solidify its position as a leader in the global manufacturing arena.', 
'2023-09-05 10:30:00', 'technology, innovation'),

('Jack Tan', 'Thailand Service Insight', 'Thailand', 'Services', 'Expanding Horizons: The Growth of Thailand�s Service Sector', 
'Thailand�s service sector is experiencing significant growth, driven by increased consumer spending and a shift towards service-oriented industries. Key areas of expansion include tourism, healthcare, and financial services. The tourism industry, a major contributor to the Thai economy, continues to attract international visitors with its rich cultural heritage and natural beauty. Investments in infrastructure and service quality are enhancing the overall visitor experience. In healthcare, Thailand is becoming a regional hub for medical tourism, offering high-quality services at competitive prices. The financial services sector is also evolving, with advancements in digital banking and fintech solutions improving accessibility and customer experience. The Thai government is supporting the sector�s growth through initiatives aimed at fostering innovation, improving service standards, and attracting investment. As the service sector continues to expand, it is expected to play a pivotal role in Thailand�s economic development and provide new opportunities for businesses and consumers alike.', 
'2023-09-08 12:45:00', 'tourism, healthcare'),

('Chloe Lim', 'Thailand Agricultural Times', 'Thailand', 'Agriculture', 'Thailand�s Agricultural Revolution: Embracing Modern Practices for Sustainable Growth', 
'Thailand�s agricultural sector is undergoing a significant transformation as the country adopts modern practices to boost productivity and sustainability. The government has launched several initiatives to support the sector, including programs to promote the use of advanced farming technologies such as drones and sensors for precision agriculture. These technologies help farmers optimize the use of resources and improve crop yields. Additionally, there is a strong focus on sustainable practices, such as organic farming and integrated pest management, to minimize environmental impact and ensure long-term soil health. The rise of agritech startups is also contributing to the sector�s modernization by providing innovative solutions for irrigation, crop monitoring, and data analysis. Despite these advancements, challenges such as climate change and fluctuating market prices remain. The Thai government is working to address these issues through research, policy support, and collaboration with international organizations. By embracing modern practices and focusing on sustainability, Thailand aims to enhance its agricultural sector and contribute to food security and rural development.', 
'2023-09-10 15:00:00', 'sustainability, technology');


-- Inserting data for Malaysia
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Max Goh', 'Malaysia Industrial Journal', 'Malaysia', 'Manufacture', 'Malaysia�s Manufacturing Sector: Driving Innovation and Economic Growth', 
'Malaysia�s manufacturing sector is a cornerstone of the country�s economy, contributing significantly to GDP and employment. Recent trends show a shift towards high-tech and high-value industries such as electronics, machinery, and aerospace. The Malaysian government is actively promoting innovation through policies that encourage research and development, technology adoption, and industry collaboration. Investments in infrastructure and technology are enhancing the sector�s competitiveness on a global scale. Local manufacturers are increasingly integrating automation and digital tools to streamline operations and improve product quality. Despite the positive growth, challenges such as a shortage of skilled labor and global economic uncertainties pose risks to the sector�s stability. To mitigate these challenges, Malaysia is focusing on upskilling its workforce and fostering partnerships between industry and academia. By leveraging its strengths and addressing its weaknesses, Malaysia aims to strengthen its position as a key player in the global manufacturing landscape.', 
'2023-10-05 09:00:00', 'innovation, technology'),

('Eva Lee', 'Malaysia Service Report', 'Malaysia', 'Services', 'The Expanding Service Sector in Malaysia: Opportunities and Trends', 
'Malaysia�s service sector is experiencing robust growth, driven by increasing demand for various services including finance, healthcare, and tourism. The sector plays a vital role in the country�s economy, contributing to job creation and economic diversification. In finance, Malaysia is making strides in fintech, with innovations in digital banking and financial services enhancing accessibility and efficiency. The healthcare sector is also growing, with investments in medical facilities and services to meet the needs of a rising population. The tourism industry, known for its rich cultural heritage and natural attractions, continues to attract international visitors, prompting developments in hospitality and related services. The Malaysian government supports the sector through initiatives aimed at improving service quality, fostering innovation, and attracting investment. As the service sector evolves, it is expected to drive economic growth and enhance Malaysia�s global competitiveness.', 
'2023-10-08 10:30:00', 'finance, healthcare'),

('James Wong', 'Malaysia Agriculture Today', 'Malaysia', 'Agriculture', 'Modernizing Malaysia�s Agriculture: Strategies for Sustainable Growth', 
'Malaysia�s agriculture sector is undergoing a modernization process aimed at increasing productivity and sustainability. The focus is on adopting advanced technologies and innovative practices to enhance crop yields and reduce environmental impact. Precision agriculture, which utilizes data-driven approaches and modern equipment, is being widely adopted to optimize resource use and improve farming efficiency. Additionally, there is a strong emphasis on sustainable practices such as organic farming and integrated pest management to promote environmental conservation. The Malaysian government is investing in research and development to support these advancements and improve the sector�s resilience. Programs are also in place to provide farmers with training and access to new technologies. Despite progress, the sector faces challenges such as climate change and market volatility. The government�s continued support and investment in technology and sustainability are crucial for building a robust agricultural sector that can meet future demands and contribute to national food security.', 
'2023-10-10 14:45:00', 'technology, sustainability');


-- Inserting data for Vietnam
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Lily Tran', 'Vietnam Manufacturing Weekly', 'Vietnam', 'Manufacture', 'Vietnam�s Manufacturing Sector: A Path to Innovation and Growth', 
'Vietnam�s manufacturing sector is undergoing a significant transformation, driven by investments in technology and innovation. The country has emerged as a key player in industries such as textiles, electronics, and machinery. Recent developments include the adoption of automation and advanced manufacturing techniques that enhance efficiency and product quality. The Vietnamese government is actively supporting the sector through policies that promote industrial growth, technology transfer, and infrastructure development. Despite these advancements, the sector faces challenges such as a shortage of skilled labor and competition from neighboring countries. To address these issues, Vietnam is focusing on improving vocational education and fostering collaborations between industry and academia. The continued growth of the manufacturing sector is expected to contribute significantly to Vietnam�s economic development and global competitiveness.', 
'2023-11-05 11:00:00', 'innovation, technology'),

('Ryan Nguyen', 'Vietnam Service Review', 'Vietnam', 'Services', 'Vietnam�s Service Sector: Emerging Trends and Opportunities', 
'Vietnam�s service sector is expanding rapidly, driven by increasing consumer demand and investments in various service industries. Key growth areas include tourism, financial services, and healthcare. The tourism sector continues to thrive, attracting international visitors with its rich cultural heritage and scenic landscapes. The financial services sector is evolving with the rise of fintech and digital banking, offering new opportunities for innovation and growth. The healthcare sector is also expanding, with improvements in medical facilities and services to cater to a growing population. The Vietnamese government supports the sector�s growth through initiatives aimed at enhancing service quality, promoting investment, and fostering innovation. As the service sector continues to evolve, it is poised to play a crucial role in Vietnam�s economic development and provide new opportunities for businesses and consumers.', 
'2023-11-08 13:15:00', 'tourism, healthcare'),

('Sophia Tran', 'Vietnam Agriculture Update', 'Vietnam', 'Agriculture', 'Modernizing Vietnam�s Agriculture: Strategies for Sustainable Growth', 
'Vietnam�s agriculture sector is experiencing a period of modernization, with a focus on improving productivity and sustainability. The government is promoting the adoption of advanced agricultural technologies such as precision farming, which uses data-driven approaches to optimize resource use and enhance crop yields. Additionally, there is a strong emphasis on sustainable practices, including organic farming and integrated pest management, to reduce environmental impact and ensure long-term soil health. The rise of agritech startups is also contributing to the sector�s transformation by providing innovative solutions for irrigation, crop monitoring, and data analysis. Despite progress, the sector faces challenges such as climate change and market fluctuations. The government�s continued investment in technology and research, along with support for farmers, is essential for building a resilient and productive agricultural sector that meets the needs of the population and contributes to food security.', 
'2023-11-10 16:30:00', 'technology, sustainability');


-- Inserting data for Indonesia
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Adam Wijaya', 'Indonesia Manufacturing Review', 'Indonesia', 'Manufacture', 'Indonesia�s Manufacturing Sector: Innovations and Challenges', 
'Indonesia�s manufacturing sector is pivotal to its economic growth, contributing significantly to GDP and employment. The sector has seen remarkable advancements, driven by increased investments in automation and technological innovation. Key industries such as automotive, textiles, and electronics are benefiting from these technological upgrades, which enhance efficiency and product quality. The government is supporting the sector through policies that promote industrial innovation, infrastructure development, and foreign direct investment. However, the sector faces challenges such as supply chain disruptions, competition from regional players, and a need for skilled labor. To address these issues, Indonesia is focusing on improving vocational training programs and fostering partnerships between industry and educational institutions. The ongoing transformation of the manufacturing sector aims to position Indonesia as a competitive player in the global market while contributing to sustainable economic development.', 
'2023-12-05 09:45:00', 'technology, innovation'),

('Sarah Indra', 'Indonesia Service Insights', 'Indonesia', 'Services', 'The Growth of Indonesia�s Service Sector: Trends and Opportunities', 
'Indonesia�s service sector is experiencing significant expansion, fueled by rising consumer demand and increased investment in various service industries. Key areas of growth include financial services, healthcare, and digital services. The financial services sector is rapidly evolving with advancements in fintech, offering innovative solutions for payments, lending, and investment. The healthcare industry is expanding with new facilities and improved services to meet the needs of a growing population. Additionally, the digital services sector is thriving, driven by the proliferation of mobile internet and e-commerce platforms. The Indonesian government is supporting this growth through initiatives aimed at enhancing service quality, promoting digital transformation, and encouraging foreign investment. As the service sector continues to develop, it is expected to play a crucial role in Indonesia�s economic diversification and growth.', 
'2023-12-08 11:00:00', 'finance, healthcare'),

('David Setiawan', 'Indonesia Agriculture Journal', 'Indonesia', 'Agriculture', 'Revitalizing Indonesia�s Agriculture: Modern Practices for Sustainable Development', 
'Indonesia�s agriculture sector is undergoing a revitalization process, with a strong focus on modernizing practices to increase productivity and sustainability. The adoption of advanced technologies such as precision farming, drones, and data analytics is transforming agricultural practices, enabling farmers to optimize resource use and enhance crop yields. The government is promoting sustainable agriculture through initiatives that support organic farming, reduce environmental impact, and improve soil health. Additionally, there is an emphasis on improving supply chains and market access for smallholder farmers. The sector faces challenges including climate change and fluctuating commodity prices, but ongoing investments in research, infrastructure, and training are crucial for addressing these issues. By embracing modern practices and focusing on sustainability, Indonesia aims to build a resilient and productive agricultural sector that contributes to food security and rural development.', 
'2023-12-10 13:30:00', 'sustainability, technology');


-- Inserting data for Laos
INSERT INTO Articles (Author, Publisher, Country, Sector, Title, Body, publishDateTime, Tags)
VALUES
('Sophie Pham', 'Laos Manufacturing Focus', 'Laos', 'Manufacture', 'Laos�s Manufacturing Sector: Opportunities and Developments', 
'Laos�s manufacturing sector is evolving, driven by efforts to attract investment and enhance industrial capabilities. The country is focusing on developing key industries such as textiles, food processing, and electronics. Recent investments in infrastructure and technology are improving production efficiency and competitiveness. The Lao government is implementing policies to support industrial growth, including incentives for foreign investors and initiatives to improve the business environment. However, the sector faces challenges such as a lack of skilled labor and infrastructure limitations. To overcome these obstacles, Laos is investing in vocational training and upgrading infrastructure to support industrial activities. The growth of the manufacturing sector is expected to play a crucial role in Laos�s economic development and contribute to job creation and industrial diversification.', 
'2024-01-05 10:00:00', 'industry, development'),

('Jackie Vong', 'Laos Service Review', 'Laos', 'Services', 'Expanding the Service Sector in Laos: Trends and Prospects', 
'The service sector in Laos is experiencing growth, with increased demand for various services such as tourism, retail, and financial services. The tourism industry, in particular, is a major contributor to the economy, attracting visitors with its unique cultural heritage and natural beauty. The financial services sector is also expanding, with developments in banking and insurance services improving accessibility and efficiency. The Lao government is supporting the sector�s growth through initiatives aimed at enhancing service quality, promoting investment, and fostering innovation. As the service sector continues to develop, it is expected to provide new opportunities for businesses and contribute to economic growth. Efforts to improve infrastructure and service standards will be key to sustaining this growth and enhancing Laos�s attractiveness as a destination for investment and tourism.', 
'2024-01-08 12:15:00', 'tourism, finance'),

('Daniel Kham', 'Laos Agricultural Journal', 'Laos', 'Agriculture', 'Transforming Laos�s Agriculture: Modern Practices for Sustainable Development', 
'Laos�s agriculture sector is undergoing a transformation, with a focus on adopting modern practices to improve productivity and sustainability. The government is promoting the use of advanced technologies such as precision farming and data analytics to optimize resource use and enhance crop yields. Sustainable agriculture practices, including organic farming and soil conservation, are being encouraged to ensure long-term environmental health. The sector faces challenges such as climate change and market fluctuations, but ongoing investments in research, infrastructure, and farmer training are helping to address these issues. By embracing modern techniques and focusing on sustainability, Laos aims to build a resilient agricultural sector that supports rural development and food security.', 
'2024-01-10 14:30:00', 'sustainability, technology');

-- Inserting images for the articles
INSERT INTO ArticleImages (ArticleID, ImageFileName)
VALUES
(1, '1.jpg'),
(1, '2.jpg'),
(1, '3.jpg'),
(2, '1.jpg'),
(2, '2.jpg'),
(2, '3.jpg'),
(3, '1.jpg'),
(3, '2.jpg'),
(3, '3.jpg'),
(4, '1.jpg'),
(4, '2.jpg'),
(4, '3.jpg'),
(5, '1.jpg'),
(5, '2.jpg'),
(5, '3.jpg'),
(6, '1.jpg'),
(6, '2.jpg'),
(6, '3.jpg'),
(7, '1.jpg'),
(7, '2.jpg'),
(7, '3.jpg'),
(8, '1.jpg'),
(8, '2.jpg'),
(8, '3.jpg'),
(9, '1.jpg'),
(9, '2.jpg'),
(9, '3.jpg'),
(10, '1.jpg'),
(10, '2.jpg'),
(10, '3.jpg'),
(11, '1.jpg'),
(11, '2.jpg'),
(11, '3.jpg'),
(12, '1.jpg'),
(12, '2.jpg'),
(12, '3.jpg'),
(13, '1.jpg'),
(13, '2.jpg'),
(13, '3.jpg'),
(14, '1.jpg'),
(14, '2.jpg'),
(14, '3.jpg'),
(15, '1.jpg'),
(15, '2.jpg'),
(15, '3.jpg'),
(16, '1.jpg'),
(16, '2.jpg'),
(16, '3.jpg'),
(17, '1.jpg'),
(17, '2.jpg'),
(17, '3.jpg'),
(18, '1.jpg'),
(18, '2.jpg'),
(18, '3.jpg'),
(19, '1.jpg'),
(19, '2.jpg'),
(19, '3.jpg'),
(20, '1.jpg'),
(20, '2.jpg'),
(20, '3.jpg'),
(21, '1.jpg'),
(21, '2.jpg'),
(21, '3.jpg'),
(22, '1.jpg'),
(22, '2.jpg'),
(22, '3.jpg'),
(23, '1.jpg'),
(23, '2.jpg'),
(23, '3.jpg'),
(24, '1.jpg'),
(24, '2.jpg'),
(24, '3.jpg'),
(25, '1.jpg'),
(25, '2.jpg'),
(25, '3.jpg'),
(26, '1.jpg'),
(26, '2.jpg'),
(26, '3.jpg'),
(27, '1.jpg'),
(27, '2.jpg'),
(27, '3.jpg'),
(28, '1.jpg'),
(28, '2.jpg'),
(28, '3.jpg'),
(29, '1.jpg'),
(29, '2.jpg'),
(29, '3.jpg'),
(30, '1.jpg'),
(30, '2.jpg'),
(30, '3.jpg');


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