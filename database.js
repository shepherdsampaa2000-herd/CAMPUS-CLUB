const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'meetings.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_title VARCHAR(200) NOT NULL,
        author VARCHAR(120),
        meeting_date TEXT,
        discussion_leader VARCHAR(120),
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) {
            db.get(`SELECT count(*) as count FROM meetings`, (err, row) => {
                if (row.count === 0) {
                    const sampleMeetings = [
                        ['To Kill a Mockingbird', 'Harper Lee', '2026-10-25', 'Alice', 'Upcoming'],
                        ['1984', 'George Orwell', '2026-11-01', 'Bob', 'Scheduled'],
                        ['The Great Gatsby', 'F. Scott Fitzgerald', '2026-11-08', 'Charlie', 'Proposed'],
                        ['Pride and Prejudice', 'Jane Austen', '2026-11-15', 'Diana', 'Scheduled'],
                        ['The Hobbit', 'J.R.R. Tolkien', '2026-11-22', 'Ethan', 'Scheduled'],
                        ['Fahrenheit 451', 'Ray Bradbury', '2026-11-29', 'Fiona', 'Proposed'],
                        ['Moby Dick', 'Herman Melville', '2026-12-06', 'George', 'Proposed'],
                        ['War and Peace', 'Leo Tolstoy', '2026-12-13', 'Hannah', 'Proposed'],
                        ['The Catcher in the Rye', 'J.D. Salinger', '2026-12-20', 'Ian', 'Proposed'],
                        ['Jane Eyre', 'Charlotte Brontë', '2026-12-27', 'Julia', 'Proposed']
                    ];

                    const stmt = db.prepare(`INSERT INTO meetings (book_title, author, meeting_date, discussion_leader, status) VALUES (?, ?, ?, ?, ?)`);
                    sampleMeetings.forEach(meeting => stmt.run(meeting));
                    stmt.finalize();
                    console.log('10 sample records inserted successfully.');
                }
            });
        }
    });
});

module.exports = db;