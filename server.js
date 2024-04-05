// Define the port for the server to listen on. If the PORT environment variable is set, use that value, otherwise default to 3001.
const PORT = process.env.PORT || 3001;

// Import necessary modules
const fs = require("fs");
const path = require("path");
const express = require("express");

// Create an instance of Express
const app = express();

// Import the array of all notes from the db.json file
const allNotes = require("./db/db.json");

// Middleware setup for parsing incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Define a GET endpoint to retrieve all notes except the first one (presumably used for managing IDs)
app.get("/api/notes", (req, res) => {
  res.json(allNotes.slice(1));
});

// Add CORS header to allow cross-origin requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Define routes for serving HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});

// If no other route matches, serve the homepage
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/404.html"));
});

// Function to create a new note
function createNewNote(body, notesArray) {
  const newNote = body;
  if (!Array.isArray(notesArray)) notesArray = [];

  if (notesArray.length === 0) notesArray.push(0);

  body.id = notesArray[0];
  notesArray[0]++;

  notesArray.push(newNote);

  // Write updated notes array to db.json
  fs.writeFileSync(
    path.join(__dirname, "./db/db.json"),
    JSON.stringify(notesArray, null, 2)
  );

  return newNote;
}

// Define a POST endpoint to create a new note
app.post("/api/notes", (req, res) => {
  const newNote = createNewNote(req.body, allNotes);
  res.json(newNote);
});

// Function to delete a note by ID
function deleteNote(id, notesArray) {
  const noteId = parseInt(id);
  const index = notesArray.findIndex((note) => note.id === noteId);

  if (index === -1) {
    return false;
  }

  notesArray.splice(index, 1);

  // Write updated notes array to db.json
  fs.writeFileSync(
    path.join(__dirname, "./db/db.json"),
    JSON.stringify(notesArray, null, 2)
  );

  return true;
}

// Define a DELETE endpoint to delete a note by ID
app.delete("/api/notes/:id", (req, res) => {
  const deleted = deleteNote(req.params.id, allNotes);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Note not found" });
  }
});

// Define a PUT endpoint to update a note by ID
app.put("/api/notes/:id", (req, res) => {
  const noteId = parseInt(req.params.id);
  const updatedNote = req.body;

  const index = allNotes.findIndex((note) => note.id === noteId);
  if (index !== -1) {
    allNotes[index] = {
      ...allNotes[index],
      ...updatedNote,
    };

    // Write updated notes array to db.json
    fs.writeFileSync(
      path.join(__dirname, "./db/db.json"),
      JSON.stringify(allNotes, null, 2)
    );

    res.json(allNotes[index]);
  } else {
    res.status(404).json({ error: "Note not found" });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () =>
  console.log(`localhost http://localhost:${PORT} 🚀`)
);
