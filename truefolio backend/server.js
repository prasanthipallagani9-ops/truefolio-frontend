// 1. Load settings from the .env file
require('dotenv').config();

// 2. Import the tools we need
const express = require('express');
const path = require('path');

// 3. Create the app
const app = express();
const PORT = process.env.PORT || 4000;

// 4. Middleware: runs on every request
app.use(express.json());                                  // lets the server read JSON from the browser
app.use(express.static(path.join(__dirname, 'public')));  // serves the files in the public folder

// 5. A test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'truefolio' });
});

// 6. Start listening for requests
app.listen(PORT, () => {
  console.log(`truefolio running at http://localhost:${PORT}`);
});