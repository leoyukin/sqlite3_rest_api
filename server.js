// server.js — Notes DB (Project 2: Express + SQLite)
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();

// 1. Connect to SQLite database (creates notes.db file if it doesn't exist)
const db = new Database('notes.db');

// 2. Initialize the Database Schema (Table)
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 3. Middleware
app.use(cors());
app.use(express.json());

// Routes will go here...

app.get('/api/notes', (req, res) => {
  const { search } = req.query;

  if (search) {
    const stmt = db.prepare('SELECT * FROM notes WHERE title LIKE ?');
    const notes = stmt.all(`%${search}%`);
    return res.json(notes);
  }

  const notes = db.prepare('SELECT * FROM notes ORDER BY id DESC').all();
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  const stmt = db.prepare('UPDATE notes SET title = ?, body = ? WHERE id = ?');
  const result = stmt.run(title, body, noteId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json({ id: noteId, title, body });
});

app.post('/api/notes', (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Titile and body required" });
  }

  const stmt = db.prepare('INSERT INTO notes (title, body) VALUES (?, ?)');

  const result = stmt.run(title, body);

  res.status(201).json({
    id: result.lastInsertRowid,
    title,
    body
  })
});

app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
  const result = stmt.run(noteId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json({ message: "Note deleted successfully", id: noteId })
})


app.listen(3001, () => {
  console.log('Database Notes server running on port 3001');
});
