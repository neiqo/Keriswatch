/* Dummy data for testing */

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
INSERT INTO Admin (user_id, username, password, email) VALUES 
((SELECT id FROM Users WHERE username = 'admin1'), 'admin1', 'pass1', 'admin1@example.com'),
((SELECT id FROM Users WHERE username = 'admin2'), 'admin2', 'pass2', 'admin2@example.com'),
((SELECT id FROM Users WHERE username = 'admin3'), 'admin3', 'pass3', 'admin3@example.com'),
((SELECT id FROM Users WHERE username = 'admin4'), 'admin4', 'pass4', 'admin4@example.com'),
((SELECT id FROM Users WHERE username = 'admin5'), 'admin5', 'pass5', 'admin5@example.com'),
((SELECT id FROM Users WHERE username = 'admin6'), 'admin6', 'pass6', 'admin6@example.com'),
((SELECT id FROM Users WHERE username = 'admin7'), 'admin7', 'pass7', 'admin7@example.com'),
((SELECT id FROM Users WHERE username = 'admin8'), 'admin8', 'pass8', 'admin8@example.com'),
((SELECT id FROM Users WHERE username = 'admin9'), 'admin9', 'pass9', 'admin9@example.com'),
((SELECT id FROM Users WHERE username = 'admin10'), 'admin10', 'pass10', 'admin10@example.com');

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
INSERT INTO Organisation (user_id, username, password, email, orgNumber) VALUES 
((SELECT id FROM Users WHERE username = 'org1'), 'org1', 'pass1', 'org1@example.com', 12345678),
((SELECT id FROM Users WHERE username = 'org2'), 'org2', 'pass2', 'org2@example.com', 22345678),
((SELECT id FROM Users WHERE username = 'org3'), 'org3', 'pass3', 'org3@example.com', 32345678),
((SELECT id FROM Users WHERE username = 'org4'), 'org4', 'pass4', 'org4@example.com', 42345678),
((SELECT id FROM Users WHERE username = 'org5'), 'org5', 'pass5', 'org5@example.com', 52345678),
((SELECT id FROM Users WHERE username = 'org6'), 'org6', 'pass6', 'org6@example.com', 62345678),
((SELECT id FROM Users WHERE username = 'org7'), 'org7', 'pass7', 'org7@example.com', 72345678),
((SELECT id FROM Users WHERE username = 'org8'), 'org8', 'pass8', 'org8@example.com', 82345678),
((SELECT id FROM Users WHERE username = 'org9'), 'org9', 'pass9', 'org9@example.com', 92345678),
((SELECT id FROM Users WHERE username = 'org10'), 'org10', 'pass10', 'org10@example.com', 02345678);

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
INSERT INTO NormalUser (user_id, username, password, email, country) VALUES 
((SELECT id FROM Users WHERE username = 'user1'), 'user1', 'pass1', 'user1@example.com', 'Singapore'),
((SELECT id FROM Users WHERE username = 'user2'), 'user2', 'pass2', 'user2@example.com', 'Malaysia'),
((SELECT id FROM Users WHERE username = 'user3'), 'user3', 'pass3', 'user3@example.com', 'Indonesia'),
((SELECT id FROM Users WHERE username = 'user4'), 'user4', 'pass4', 'user4@example.com', 'Singapore'),
((SELECT id FROM Users WHERE username = 'user5'), 'user5', 'pass5', 'user5@example.com', 'Malaysia'),
((SELECT id FROM Users WHERE username = 'user6'), 'user6', 'pass6', 'user6@example.com', 'Indonesia'),
((SELECT id FROM Users WHERE username = 'user7'), 'user7', 'pass7', 'user7@example.com', 'Singapore'),
((SELECT id FROM Users WHERE username = 'user8'), 'user8', 'pass8', 'user8@example.com', 'Malaysia'),
((SELECT id FROM Users WHERE username = 'user9'), 'user9', 'pass9', 'user9@example.com', 'Indonesia'),
((SELECT id FROM Users WHERE username = 'user10'), 'user10', 'pass10', 'user10@example.com', 'Singapore');
