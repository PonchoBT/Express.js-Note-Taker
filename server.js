// Import Express.js
const express = require("express");
// Import built-in Node.js package 'path' to resolve path of files that are located on the server
const path = require("path");
// Initialize an instance of Express.js
const app = express();
// Specify on which port the Express.js server will run
const PORT = 3001;

// Static middleware pointing to the public folder
app.use(express.static("public"));


// ('/') = index (home)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// ('/notes') = notes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// ('/404') = notes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/404.html'));
});


// listen() method is responsible for listening for incoming connections on the specified port
app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
