use bed_db;

-- Insert sample data into the Articles table
INSERT INTO Articles (Author, Publisher, Sector, Title, Body, publishDateTime, Tags)
VALUES 
    ('John Doe', 'Tech News Co.', 'Manufacture', 'Introduction to AI', 'Artificial intelligence is reshaping industries...', '2024-06-15 10:00:00', 'AI, Technology'),
    ('Jane Smith', 'Science Daily', 'Services', 'Recent Discoveries in Quantum Physics', 'Quantum physics continues to reveal...', '2024-06-14 09:30:00', 'Quantum Physics, Science'),
    ('Michael Brown', 'Health Magazine', 'Services', 'The Benefits of Meditation', 'Meditation has shown to have numerous benefits for mental health...', '2024-06-13 15:45:00', 'Meditation, Health'),
    ('Emily Johnson', 'Fashion World', 'Manufacture', 'Trends in Summer Fashion 2024', 'Discover the latest trends in summer fashion for this year...', '2024-06-12 11:20:00', 'Fashion, Lifestyle'),
    ('David Lee', 'Foodie Times', 'Agriculture', 'Top 10 Restaurants in New York City', 'Explore the best dining experiences in NYC...', '2024-06-11 08:00:00', 'Food, Dining');
