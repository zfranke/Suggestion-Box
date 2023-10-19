USE suggestion_box;

-- Create a table for suggestions
CREATE TABLE suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  suggestion_text TEXT NOT NULL
);

-- Create a table for user accounts
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  passwordHash CHAR(60) NOT NULL
);

-- Insert a basic user
INSERT INTO users (username, passwordHash)
VALUES ('zfranke@live.com', '$2a$10$57OA03ZDaCHy2uwKnSwgp.kO35fRD1dPL2tOgUwJdRvd96AalaOBW');