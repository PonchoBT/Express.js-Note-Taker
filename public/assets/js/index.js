// Declare variables to store references to various DOM elements related to note-taking
let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let clearBtn;
let noteList;
let updateNoteBtn;

// If the current window location is "/notes", assign DOM element references to the variables
if (window.location.pathname === "/notes") {
  noteForm = document.querySelector(".note-form");
  noteTitle = document.querySelector(".note-title");
  noteText = document.querySelector(".note-textarea");
  saveNoteBtn = document.querySelector(".save-note");
  newNoteBtn = document.querySelector(".new-note");
  clearBtn = document.querySelector(".clear-btn");
  noteList = document.querySelectorAll(".list-container .list-group");
  updateNoteBtn = document.querySelector(".update-note");
}

// Function to display an element
const show = (elem) => {
  elem.style.display = "inline";
};

// Function to hide an element
const hide = (elem) => {
  elem.style.display = "none";
};

// Variable to store the active note being edited
let activeNote = {};

// Function to fetch all notes from the server
const getNotes = () =>
  fetch("/api/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

// Function to save a new note to the server
const saveNote = (note) =>
  fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

// Function to delete a note from the server by ID
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

// Function to update a note on the server by ID
const updateNote = (id, note) =>
  fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

// Function to render the active note being edited
const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.removeAttribute("readonly");
    noteText.removeAttribute("readonly");
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.value = "";
    noteText.value = "";
  }
};

// Function to handle saving or updating a note
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  if (activeNote.id) {
    updateNote(activeNote.id, newNote).then(() => {
      activeNote = {};
      getAndRenderNotes();
      renderActiveNote();
    });
  } else {
    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  }
};

// Function to handle deleting a note
const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target.parentElement;
  const noteId = JSON.parse(note.getAttribute("data-note")).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Function to handle viewing a note
const handleNoteView = (e) => {
  e.preventDefault();
  const selectedNote = JSON.parse(
    e.currentTarget.parentElement.getAttribute("data-note")
  );
  activeNote = selectedNote;
  renderActiveNote();
};

// Function to handle creating a new note
const handleNewNoteView = () => {
  activeNote = {};
  renderActiveNote();
};

// Function to handle clearing the note form
const handleClearForm = () => {
  activeNote = {};
  noteTitle.value = "";
  noteText.value = "";
  renderActiveNote();
};

// Function to create a list item for a note
const createLi = (text, delBtn = true) => {
  const liEl = document.createElement("li");
  liEl.classList.add("list-group-item");

  const spanEl = document.createElement("span");
  spanEl.innerText = text;
  spanEl.addEventListener("click", handleNoteView);

  const updateIcon = document.createElement("span");
  updateIcon.innerHTML = '<i class="fas fa-edit"></i>';
  updateIcon.classList.add("float-right", "text-primary", "update-note");
  updateIcon.addEventListener("click", handleUpdateNote);
  spanEl.appendChild(updateIcon);

  liEl.appendChild(spanEl);

  if (delBtn) {
    const delBtnEl = document.createElement("i");
    delBtnEl.classList.add(
      "fas",
      "fa-trash-alt",
      "float-right",
      "text-danger",
      "delete-note"
    );
    delBtnEl.addEventListener("click", handleNoteDelete);

    liEl.appendChild(delBtnEl);
  }

  return liEl;
};

// Function to render the list of notes
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === "/notes") {
    noteList.forEach((el) => (el.innerHTML = ""));
  }

  let noteListItems = [];

  if (jsonNotes.length === 0) {
    const emptyListItem = document.createElement("li");
    emptyListItem.classList.add("list-group-item");
    emptyListItem.innerText = "No saved Notes";
    noteListItems.push(emptyListItem);
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (window.location.pathname === "/notes") {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Function to get and render the notes
const getAndRenderNotes = () => getNotes().then(renderNoteList);

// Function to handle rendering the save and clear buttons based on input fields
const handleRenderBtns = () => {
  if (noteTitle.value.trim() !== "" || noteText.value.trim() !== "") {
    show(clearBtn);
  } else {
    hide(clearBtn);
  }

  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Function to handle updating a note
const handleUpdateNote = (e) => {
  console.log("Update note clicked");
};

// Event listeners for various actions on the note form
if (window.location.pathname === "/notes") {
  saveNoteBtn.addEventListener("click", handleNoteSave);
  newNoteBtn.addEventListener("click", handleNewNoteView);
  clearBtn.addEventListener("click", handleClearForm);
  noteTitle.addEventListener("input", handleRenderBtns);
  noteText.addEventListener("input", handleRenderBtns);
}

// Initial fetching and rendering of notes
getAndRenderNotes();
