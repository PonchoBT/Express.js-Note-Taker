const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const allNotes = require('./db/db.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
    res.json(allNotes.slice(1));
});

// Añadir encabezado CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

function createNewNote(body, notesArray) {
    const newNote = body;
    if (!Array.isArray(notesArray))
        notesArray = [];
    
    if (notesArray.length === 0)
        notesArray.push(0);

    body.id = notesArray[0];
    notesArray[0]++;

    notesArray.push(newNote);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesArray, null, 2)
    );
    return newNote;
}

app.post('/api/notes', (req, res) => {
    const newNote = createNewNote(req.body, allNotes);
    res.json(newNote);
});

function deleteNote(id, notesArray) {
    const noteId = parseInt(id);

    const index = notesArray.findIndex(note => note.id === noteId);

    if (index === -1) {
        return false;
    }

    notesArray.splice(index, 1);

    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesArray, null, 2)
    );

    return true;
}

app.delete('/api/notes/:id', (req, res) => {
    const deleted = deleteNote(req.params.id, allNotes);
    if (deleted) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

app.put('/api/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    const updatedNote = req.body;

    const index = allNotes.findIndex(note => note.id === noteId);
    if (index !== -1) {
        allNotes[index] = {
            ...allNotes[index],
            ...updatedNote
        };

        fs.writeFileSync(
            path.join(__dirname, './db/db.json'),
            JSON.stringify(allNotes, null, 2)
        );

        res.json(allNotes[index]);
    } else {
        res.status(404).json({ error: 'Note not found' });
    }
});

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
