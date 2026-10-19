const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const clubsRouter = require('./routes/Clubs');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Campus Club Backend is running!' });
});

app.use('/api/clubs', clubsRouter);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Campus Club backend running on port ${PORT}`);
});