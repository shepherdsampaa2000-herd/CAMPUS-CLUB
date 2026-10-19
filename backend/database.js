const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file inside the backend folder
const dbPath = path.join(__dirname, 'clubs.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }

    console.log('SQLite database connected!');
    initializeDatabase();
});

function initializeDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS clubs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                location TEXT,
                meeting_day TEXT,
                membership_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Table creation failed:', err.message);
                return;
            }

            addMissingColumns();
        });
    });
}

function addMissingColumns() {
    db.all('PRAGMA table_info(clubs)', (err, columns) => {
        if (err) {
            console.error('Could not check table columns:', err.message);
            return;
        }

        const existing = columns.map(column => column.name);

        const additions = [
            ['location', 'TEXT'],
            ['meeting_day', 'TEXT'],
            ['membership_count', 'INTEGER DEFAULT 0'],
            ['created_at', 'TEXT'],
            ['updated_at', 'TEXT']
        ];

        const pending = additions.filter(
            ([name]) => !existing.includes(name)
        );

        function addNextColumn() {
            if (pending.length === 0) {
                updateTimestamps();
                return;
            }

            const [name, type] = pending.shift();

            db.run(
                `ALTER TABLE clubs ADD COLUMN ${name} ${type}`,
                (err) => {
                    if (err) {
                        console.error(`Could not add ${name}:`, err.message);
                    } else {
                        console.log(`Added column: ${name}`);
                    }

                    addNextColumn();
                }
            );
        }

        addNextColumn();
    });
}

function updateTimestamps() {
    db.run(`
        UPDATE clubs
        SET created_at = CURRENT_TIMESTAMP
        WHERE created_at IS NULL
    `, (err) => {
        if (err) {
            console.error('Created_at update failed:', err.message);
            return;
        }

        db.run(`
            UPDATE clubs
            SET updated_at = CURRENT_TIMESTAMP
            WHERE updated_at IS NULL
        `, (err) => {
            if (err) {
                console.error('Updated_at update failed:', err.message);
                return;
            }

            console.log('Clubs table is ready!');
            insertSampleClubs();
        });
    });
}

function insertSampleClubs() {
    const clubs = [
        ['Coding Club', 'Learn programming and build projects', 'Technology', 'Computer Lab', 'Monday', 30],
        ['Robotics Club', 'Build and program robots', 'Technology', 'Engineering Lab', 'Tuesday', 20],
        ['Debate Club', 'Develop public speaking skills', 'Academic', 'Lecture Room 1', 'Wednesday', 25],
        ['Football Club', 'Play and practise football', 'Sports', 'Sports Ground', 'Thursday', 40],
        ['Music Club', 'Practise singing and instruments', 'Arts', 'Music Room', 'Friday', 18],
        ['Drama Club', 'Perform plays and develop acting skills', 'Arts', 'Main Hall', 'Monday', 15],
        ['Environmental Club', 'Promote environmental awareness', 'Community', 'Campus Garden', 'Tuesday', 22],
        ['Chess Club', 'Learn and play chess', 'Games', 'Library', 'Wednesday', 12],
        ['Photography Club', 'Learn photography and editing', 'Arts', 'Media Room', 'Thursday', 16],
        ['Entrepreneurship Club', 'Develop business ideas', 'Business', 'Business Block', 'Friday', 28]
    ];

    db.get('SELECT COUNT(*) AS total FROM clubs', (err, row) => {
        if (err) {
            console.error('Could not count clubs:', err.message);
            return;
        }

        if (row.total > 0) {
            console.log('Clubs already exist. Sample data skipped.');
            return;
        }

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const statement = db.prepare(`
                INSERT INTO clubs
                (name, description, category, location, meeting_day, membership_count)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            clubs.forEach(club => {
                statement.run(club);
            });

            statement.finalize((err) => {
                if (err) {
                    console.error('Sample clubs insertion failed:', err.message);
                    db.run('ROLLBACK');
                    return;
                }

                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Could not save sample clubs:', err.message);
                        return;
                    }

                    console.log('10 sample clubs inserted successfully!');
                });
            });
        });
    });
}

module.exports = db;