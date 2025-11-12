--FILES TABLE
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, 
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    hash VARCHAR(64) NOT NULL, -- SHA-256
    path TEXT NOT NULL,        -- file storage path
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ref_count INT DEFAULT 1    -- deduplication
);

--USER TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    storage_quota BIGINT DEFAULT 10485760 -- 10 MB default
);

--ADDING TAGS FOR SEARCH AND FILTERS
ALTER TABLE files ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE users RENAME COLUMN password TO password_hash;

ALTER TABLE files 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private';


ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

ALTER TABLE files 
ADD COLUMN IF NOT EXISTS download_count INT DEFAULT 0;

INSERT INTO users (username, storage_quota, role, password_hash, email)
SELECT 
    'admin1001',
    41943040,
    'admin',
    '$2a$10$e4NF/NSmjqbB0d3qbJY1LeH1AeZ/iiE1F/D6U4bTuozpI0gXjK40K',
    'admin1001@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin1001'
);
