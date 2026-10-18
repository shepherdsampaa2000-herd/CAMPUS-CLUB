const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. GET /api/meetings -> List all records
app.get('/api/meetings', (req, res) => {
    db.all(`SELECT * FROM meetings`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// 2. GET /api/meetings/:id -> Get one record
app.get('/api/meetings/:id', (req, res) => {
    db.get(`SELECT * FROM meetings WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "success", data: row });
    });
});

// 3. POST /api/meetings -> Create a record
app.post('/api/meetings', (req, res) => {
    const { book_title, author, meeting_date, discussion_leader, status } = req.body;
    if (!book_title) return res.status(400).json({ error: "book_title is required" });

    const sql = `INSERT INTO meetings (book_title, author, meeting_date, discussion_leader, status) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [book_title, author, meeting_date, discussion_leader, status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            message: "success",
            data: { id: this.lastID, book_title, author, meeting_date, discussion_leader, status }
        });
    });
});

// 4. PUT /api/meetings/:id -> Update a record
app.put('/api/meetings/:id', (req, res) => {
    const { book_title, author, meeting_date, discussion_leader, status } = req.body;
    const sql = `UPDATE meetings SET book_title = COALESCE(?, book_title), author = COALESCE(?, author), meeting_date = COALESCE(?, meeting_date), discussion_leader = COALESCE(?, discussion_leader), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(sql, [book_title, author, meeting_date, discussion_leader, status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "success", changes: this.changes });
    });
});

// 5. DELETE /api/meetings/:id -> Delete a record
app.delete('/api/meetings/:id', (req, res) => {
    db.run(`DELETE FROM meetings WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "deleted", changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});