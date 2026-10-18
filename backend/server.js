const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import the clubs routes
const clubsRouter = require('./routes/Clubs');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Campus Club Backend is running!');
});

app.use('/api/clubs', clubsRouter);

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});