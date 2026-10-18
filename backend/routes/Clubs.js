const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. GET all clubs
router.get('/', (req, res) => {
    db.all('SELECT * FROM clubs', [], (err, clubs) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(clubs);
    });
});

// 2. GET one club
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM clubs WHERE id = ?', [req.params.id], (err, club) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!club) return res.status(404).json({ message: 'Club not found' });
        res.json(club);
    });
});

// 3. POST a new club
router.post('/', (req, res) => {
    const {
        name, description, category, location, meeting_day, membership_count
    } = req.body;

    if (
        !name || !description || !category || !location || !meeting_day ||
        membership_count === undefined || membership_count === ''
    ) {
        return res.status(400).json({
            message: 'Please fill in all club fields'
        });
    }

    const members = Number(membership_count);

    if (!Number.isInteger(members) || members < 0) {
        return res.status(400).json({
            message: 'Number of members must be a non-negative whole number'
        });
    }

    db.run(
        `INSERT INTO clubs
        (name, description, category, location, meeting_day, membership_count)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, category, location, meeting_day, members],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });

            db.get('SELECT * FROM clubs WHERE id = ?', [this.lastID], (err, club) => {
                if (err) return res.status(500).json({ message: err.message });

                res.status(201).json({
                    message: 'Club created successfully',
                    club
                });
            });
        }
    );
});

// 4. PUT - Update a club
router.put('/:id', (req, res) => {
    const {
        name, description, category, location, meeting_day, membership_count
    } = req.body;

    if (
        !name || !description || !category || !location || !meeting_day ||
        membership_count === undefined || membership_count === ''
    ) {
        return res.status(400).json({
            message: 'Please fill in all club fields'
        });
    }

    const members = Number(membership_count);

    if (!Number.isInteger(members) || members < 0) {
        return res.status(400).json({
            message: 'Number of members must be a non-negative whole number'
        });
    }

    db.run(
        `UPDATE clubs
         SET name = ?, description = ?, category = ?, location = ?,
             meeting_day = ?, membership_count = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
            name, description, category, location, meeting_day,
            members, req.params.id
        ],
        function (err) {
            if (err) return res.status(500).json({ message: err.message });

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Club not found' });
            }

            res.json({ message: 'Club updated successfully' });
        }
    );
});

// 5. DELETE a club
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM clubs WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ message: err.message });

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Club not found' });
        }

        res.json({ message: 'Club deleted successfully' });
    });
});

module.exports = router;