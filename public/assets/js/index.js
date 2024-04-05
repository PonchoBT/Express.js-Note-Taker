let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let clearBtn;
let noteList;
let updateNoteBtn;

if (window.location.pathname === "/notes") {
  noteForm = document.querySelector(".note-form");
  noteTitle = document.querySelector(".note-title");
  noteText = document.querySelector(".note-textarea");
  saveNoteBtn = document.querySelector(".save-note");
  newNoteBtn = document.querySelector(".new-note");
  clearBtn = document.querySelector(".clear-btn");
  noteList = document.querySelectorAll(".list-container .list-group");
  updateNoteBtn = document.querySelector(".update-note"); // Seleccionamos el botón de actualizar
}

const show = (elem) => {
  elem.style.display = "inline";
};

const hide = (elem) => {
  elem.style.display = "none";
};

let activeNote = {};

const getNotes = () =>
  fetch("/api/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

const saveNote = (note) =>
  fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

const updateNote = (id, note) =>
  fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

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

const handleNoteView = (e) => {
  e.preventDefault();
  const selectedNote = JSON.parse(
    e.currentTarget.parentElement.getAttribute("data-note")
  );
  activeNote = selectedNote;
  renderActiveNote();
};

const handleNewNoteView = () => {
  activeNote = {};
  renderActiveNote();
};

const handleClearForm = () => {
  activeNote = {};
  noteTitle.value = "";
  noteText.value = "";
  renderActiveNote();
};

const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === "/notes") {
    noteList.forEach((el) => (el.innerHTML = ""));
  }

  let noteListItems = [];

  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement("li");
    liEl.classList.add("list-group-item");

    const spanEl = document.createElement("span");
    spanEl.innerText = text;
    spanEl.addEventListener("click", handleNoteView);

    // Agregar el ícono de actualización dentro del span
    const updateIcon = document.createElement("span");
    updateIcon.innerHTML = '<i class="fas fa-edit"></i>';
    updateIcon.classList.add("float-right", "text-primary", "update-note");
    updateIcon.addEventListener("click", handleUpdateNote);
    spanEl.appendChild(updateIcon);

    liEl.append(spanEl);

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

      liEl.append(delBtnEl);
    }

    return liEl;
  };

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

const getAndRenderNotes = () => getNotes().then(renderNoteList);

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

const handleUpdateNote = (e) => {
  console.log("Update note clicked");
};

if (window.location.pathname === "/notes") {
  saveNoteBtn.addEventListener("click", handleNoteSave);
  newNoteBtn.addEventListener("click", handleNewNoteView);
  clearBtn.addEventListener("click", handleClearForm);
  noteTitle.addEventListener("input", handleRenderBtns);
  noteText.addEventListener("input", handleRenderBtns);
}

getAndRenderNotes();
