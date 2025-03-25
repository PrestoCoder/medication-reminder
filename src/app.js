// src/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const callRoutes = require('./routes/callRoutes');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Register call-related routes
app.use('/', callRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
     console.log(`Medication Reminder System server is running on port ${PORT}`);
});

module.exports = app; // Export for testing
