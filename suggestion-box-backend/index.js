const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS options using FRONTEND_URL from .env
// const corsOptions = {
//   origin: process.env.FRONTEND_URL,
//   methods: 'GET,POST,PUT,DELETE',
//   allowedHeaders: 'Content-Type,Authorization',
// };

// Enable CORS with configured options
app.use(cors());
app.use(bodyParser.json());

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Adjust this based on your requirements
  queueLimit: 0,
});

// API Endpoint to Register User
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the username is already taken
  const checkUsernameSql = 'SELECT * FROM users WHERE username = ?';
  pool.query(checkUsernameSql, [username], (err, rows) => {
    if (err) {
      console.error('Error checking username:', err);
      res.status(500).json({ error: 'Error checking username' });
      return;
    }

    // If username already exists, return an error
    if (rows.length > 0) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Hash the password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert user into the database
    const insertUserSql = 'INSERT INTO users (username, passwordHash) VALUES (?, ?)';
    pool.query(insertUserSql, [username, passwordHash], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Error registering user' });
      } else {
        // User registered; generate and send JWT
        const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
          expiresIn: '1h', // Set token expiration
        });

        res.status(200).json({ token });
      }
    });
  });
});

// API Endpoint to Authenticate and Get JWT
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Retrieve user from the database based on username
  const getUserQuery = 'SELECT * FROM users WHERE username = ?';

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'Error getting database connection' });
      return;
    }

    connection.query(getUserQuery, [username], (err, results) => {
      connection.release();

      if (err) {
        console.error('Error retrieving user:', err);
        res.status(500).json({ error: 'Error retrieving user' });
        return;
      }

      // Check if user exists and password matches
      const user = results[0];
      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      // User authenticated; generate and send JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Set token expiration
      });

      res.status(200).json({ token });
    });
  });
});

// Middleware to check if the token is valid
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  console.log("Token: " + token);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


// API Endpoint to Get Suggestions (Protected with authentication)
app.get('/api/get-suggestions', authenticateToken, (req, res) => {
  const sql = 'SELECT * FROM suggestions';
  
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'Error getting database connection' });
      return;
    }

    // Execute the query
    connection.query(sql, (err, results) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error('Error getting suggestions:', err);
        res.status(500).json({ error: 'Error getting suggestions' });
      } else {
        res.status(200).json(results);
      }
    });
  });
});


// API Endpoint to Submit Suggestion
app.post('/api/submit-suggestion', (req, res) => {
  const { suggestion } = req.body;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'Error getting database connection' });
      return;
    }

    // Perform the database operation
    const sql = 'INSERT INTO suggestions (suggestion_text) VALUES (?)';
    connection.query(sql, [suggestion], (err, result) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error('Error submitting suggestion:', err);
        res.status(500).json({ error: 'Error submitting suggestion' });
      } else {
        console.log('Suggestion submitted:', result);
        res.status(200).json({ message: 'Suggestion submitted successfully' });
      }
    });
  });
});

// API Endpoint to Delete Suggestion (Protected with authentication)
app.delete('/api/delete-suggestion/:id', authenticateToken, (req, res) => {
  const suggestionId = req.params.id;
  const sql = 'DELETE FROM suggestions WHERE id = ?';

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).json({ error: 'Error getting database connection' });
      return;
    }

    // Execute the query
    connection.query(sql, [suggestionId], (err, result) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error('Error deleting suggestion:', err);
        res.status(500).json({ error: 'Error deleting suggestion' });
      } else {
        console.log('Suggestion deleted:', result);
        res.status(200).json({ message: 'Suggestion deleted successfully' });
      }
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
