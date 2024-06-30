/* Dummy data for testing */

-- Insert Admin Users
INSERT INTO Users (username, password, email, role) VALUES 
('admin1', 'pass1Example', 'admin1@example.com', 'Admin'),
('admin2', 'pass2Example', 'admin2@example.com', 'Admin'),
('admin3', 'pass3Example', 'admin3@example.com', 'Admin'),
('admin4', 'pass4Example', 'admin4@example.com', 'Admin'),
('admin5', 'pass5Example', 'admin5@example.com', 'Admin'),
('admin6', 'pass6Example', 'admin6@example.com', 'Admin'),
('admin7', 'pass7Example', 'admin7@example.com', 'Admin'),
('admin8', 'pass8Example', 'admin8@example.com', 'Admin'),
('admin9', 'pass9Example', 'admin9@example.com', 'Admin'),
('admin10', 'pass10Example', 'admin10@example.com', 'Admin');

-- Insert into Admin table
INSERT INTO Admin (user_id, username, password, email) VALUES 
((SELECT id FROM Users WHERE username = 'admin1'),'admin1', 'pass1Example', 'admin1@example.com'),
((SELECT id FROM Users WHERE username = 'admin2'),'admin2', 'pass2Example', 'admin2@example.com'),
((SELECT id FROM Users WHERE username = 'admin3'),'admin3', 'pass3Example', 'admin3@example.com'),
((SELECT id FROM Users WHERE username = 'admin4'),'admin4', 'pass4Example', 'admin4@example.com'),
((SELECT id FROM Users WHERE username = 'admin5'),'admin5', 'pass5Example', 'admin5@example.com'),
((SELECT id FROM Users WHERE username = 'admin6'),'admin6', 'pass6Example', 'admin6@example.com'),
((SELECT id FROM Users WHERE username = 'admin7'),'admin7', 'pass7Example', 'admin7@example.com'),
((SELECT id FROM Users WHERE username = 'admin8'),'admin8', 'pass8Example', 'admin8@example.com'),
((SELECT id FROM Users WHERE username = 'admin9'),'admin9', 'pass9Example', 'admin9@example.com'),
((SELECT id FROM Users WHERE username = 'admin10'),'admin10', 'pass10Example', 'admin10@example.com');

-- Insert Organisation Users
INSERT INTO Users (username, password, email, role) VALUES 
('org1', 'orgpass1Example', 'org1@example.com', 'Organisation'),
('org2', 'orgpass2Example', 'org2@example.com', 'Organisation'),
('org3', 'orgpass3Example', 'org3@example.com', 'Organisation'),
('org4', 'orgpass4Example', 'org4@example.com', 'Organisation'),
('org5', 'orgpass5Example', 'org5@example.com', 'Organisation'),
('org6', 'orgpass6Example', 'org6@example.com', 'Organisation'),
('org7', 'orgpass7Example', 'org7@example.com', 'Organisation'),
('org8', 'orgpass8Example', 'org8@example.com', 'Organisation'),
('org9', 'orgpass9Example', 'org9@example.com', 'Organisation'),
('org10', 'orgpass10Example', 'org10@example.com', 'Organisation');

-- Insert Normal Users
INSERT INTO Users (username, password, email, role) VALUES 
('user1', 'userpass1Example', 'user1@example.com', 'NormalUser'),
('user2', 'userpass2Example', 'user2@example.com', 'NormalUser'),
('user3', 'userpass3Example', 'user3@example.com', 'NormalUser'),
('user4', 'userpass4Example', 'user4@example.com', 'NormalUser'),
('user5', 'userpass5Example', 'user5@example.com', 'NormalUser'),
('user6', 'userpass6Example', 'user6@example.com', 'NormalUser'),
('user7', 'userpass7Example', 'user7@example.com', 'NormalUser'),
('user8', 'userpass8Example', 'user8@example.com', 'NormalUser'),
('user9', 'userpass9Example', 'user9@example.com', 'NormalUser'),
('user10', 'userpass10Example', 'user10@example.com', 'NormalUser');

-- Insert into Organisation table
INSERT INTO Organisation (user_id, username, password, email, orgNumber) VALUES 
((SELECT id FROM Users WHERE username = 'org1'), 'org1', 'orgpass1Example', 'org1@example.com', 101),
((SELECT id FROM Users WHERE username = 'org2'), 'org2', 'orgpass2Example', 'org2@example.com', 102),
((SELECT id FROM Users WHERE username = 'org3'), 'org3', 'orgpass3Example', 'org3@example.com', 103),
((SELECT id FROM Users WHERE username = 'org4'), 'org4', 'orgpass4Example', 'org4@example.com', 104),
((SELECT id FROM Users WHERE username = 'org5'), 'org5', 'orgpass5Example', 'org5@example.com', 105),
((SELECT id FROM Users WHERE username = 'org6'), 'org6', 'orgpass6Example', 'org6@example.com', 106),
((SELECT id FROM Users WHERE username = 'org7'), 'org7', 'orgpass7Example', 'org7@example.com', 107),
((SELECT id FROM Users WHERE username = 'org8'), 'org8', 'orgpass8Example', 'org8@example.com', 108),
((SELECT id FROM Users WHERE username = 'org9'), 'org9', 'orgpass9Example', 'org9@example.com', 109),
((SELECT id FROM Users WHERE username = 'org10'), 'org10', 'orgpass10Example', 'org10@example.com', 110);

-- Insert into NormalUser table
INSERT INTO NormalUser (user_id, username, password, email, country) VALUES 
((SELECT id FROM Users WHERE username = 'user1'), 'user1', 'userpass1Example', 'user1@example.com', 'Country1'),
((SELECT id FROM Users WHERE username = 'user2'), 'user2', 'userpass2Example', 'user2@example.com', 'Country2'),
((SELECT id FROM Users WHERE username = 'user3'), 'user3', 'userpass3Example', 'user3@example.com', 'Country3'),
((SELECT id FROM Users WHERE username = 'user4'), 'user4', 'userpass4Example', 'user4@example.com', 'Country4'),
((SELECT id FROM Users WHERE username = 'user5'), 'user5', 'userpass5Example', 'user5@example.com', 'Country5'),
((SELECT id FROM Users WHERE username = 'user6'), 'user6', 'userpass6Example', 'user6@example.com', 'Country6'),
((SELECT id FROM Users WHERE username = 'user7'), 'user7', 'userpass7Example', 'user7@example.com', 'Country7'),
((SELECT id FROM Users WHERE username = 'user8'), 'user8', 'userpass8Example', 'user8@example.com', 'Country8'),
((SELECT id FROM Users WHERE username = 'user9'), 'user9', 'userpass9Example', 'user9@example.com', 'Country9'),
((SELECT id FROM Users WHERE username = 'user10'), 'user10', 'userpass10Example', 'user10@example.com', 'Country10');
