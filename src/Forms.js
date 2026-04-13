import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

const NOTES_STORAGE_KEY = "googleKeepNotes";

const formatReminderLabel = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString();
};

function Forms() {
  const [notes, setNotes] = useState([]);
  const [activeFormOpen, setActiveFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState("");
  const [toasts, setToasts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const activeFormRef = useRef(null);
  const inactiveFormRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setNotes(
          parsed.map((note) => ({
            ...note,
            color: note.color || "",
            reminderDateTime: note.reminderDateTime ? new Date(note.reminderDateTime) : null,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const serialized = notes.map((note) => ({
      ...note,
      reminderDateTime: note.reminderDateTime ? note.reminderDateTime.toISOString() : null,
    }));
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(serialized));
  }, [notes]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkReminders, 30000);
    checkReminders();
    return () => clearInterval(interval);
  }, [notes]);

  useEffect(() => {
    if (!activeFormOpen) {
      return undefined;
    }

    const handleBodyClick = (event) => {
      if (
        activeFormRef.current?.contains(event.target) ||
        inactiveFormRef.current?.contains(event.target)
      ) {
        return;
      }

      saveNoteAndClose();
    };

    document.body.addEventListener("click", handleBodyClick);
    return () => document.body.removeEventListener("click", handleBodyClick);
  }, [activeFormOpen, title, text, reminderActive, reminderDateTime]);

  const resetForm = () => {
    setTitle("");
    setText("");
    setReminderActive(false);
    setReminderDateTime("");
  };

  const addToast = (message) => {
    const id = Date.now().toString();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const notifyReminder = (note) => {
    const reminderLabel = note.title ? note.title : "Reminder";
    const message = `${reminderLabel} is due now.`;
    addToast(message);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Keep Clone Reminder", { body: message });
    }
  };

  const checkReminders = () => {
    const now = new Date();
    let updated = false;

    const nextNotes = notes.map((note) => {
      if (
        note.reminderActive &&
        note.reminderDateTime instanceof Date &&
        !note.reminderTriggered &&
        now >= note.reminderDateTime
      ) {
        updated = true;
        notifyReminder(note);
        return { ...note, reminderTriggered: true };
      }
      return note;
    });

    if (updated) {
      setNotes(nextNotes);
    }
  };

  const openActiveForm = () => {
    setActiveFormOpen(true);
  };

  const closeActiveForm = () => {
    setActiveFormOpen(false);
    resetForm();
  };

  const saveNoteIfNeeded = () => {
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    if (!trimmedTitle && !trimmedText && !reminderActive) {
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title: trimmedTitle,
      text: trimmedText,
      color: "",
      reminderActive,
      reminderDateTime:
        reminderActive && reminderDateTime ? new Date(reminderDateTime) : null,
      reminderTriggered: false,
    };

    setNotes((current) => [newNote, ...current]);
  };

  const saveNoteAndClose = () => {
    saveNoteIfNeeded();
    closeActiveForm();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveNoteAndClose();
  };

  const deleteNote = (noteId) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingNote(null);
  };

  const saveEditedNote = (updatedNote) => {
    setNotes((current) =>
      current.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const toggleNoteColor = (noteId) => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== noteId) return note;

        const isChanged = note.color === "#F39F76";
        const isDarkMode = document.body.classList.contains("dark-mode");
        const nextColor = isDarkMode
          ? isChanged
            ? ""
            : "#F39F76"
          : isChanged
          ? "#fff"
          : "#F39F76";

        return {
          ...note,
          color: nextColor,
        };
      })
    );
  };

  const upcomingReminders = notes
    .filter(
      (note) =>
        note.reminderActive &&
        note.reminderDateTime instanceof Date &&
        !note.reminderTriggered &&
        note.reminderDateTime > new Date()
    )
    .sort((a, b) => a.reminderDateTime - b.reminderDateTime)
    .slice(0, 5);

  return (
    
    <section className="notes-section">
      <div className="form-container">
        <form
          id="take-note"
          className={`take-note border inactive-form ${activeFormOpen ? "hidden" : ""}`}
          ref={inactiveFormRef}
          onClick={openActiveForm}
        >
          <div className="take-input">
            <input
              id="takeNotes"
              className="searchID"
              type="text"
              placeholder="Take a note..."
              readOnly
            />
          </div>
          <div className="take-tools">
            <div className="tools-svg toolsDark">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
              </svg>
            </div>
            <div className="tools-svg toolsDark">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M240-120q-45 0-89-22t-71-58q26 0 53-20.5t27-59.5q0-50 35-85t85-35q50 0 85 35t35 85q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 23-5.5 42T220-202q5 2 10 2h10Zm230-160L360-470l358-358q11-11 27.5-11.5T774-828l54 54q12 12 12 28t-12 28L470-360Zm-190 80Z" />
              </svg>
            </div>
            <div className="tools-svg toolsDark">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
              </svg>
            </div>
          </div>
        </form>

        <form
          id="sec-form"
          ref={activeFormRef}
          className={`sec-form border active-form ${activeFormOpen ? "expanded" : ""}`}
          onSubmit={handleSubmit}
        >
          <div className="sec-top">
            <div className="title-input">
              <input
                id="note-title"
                className="searchID"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="pin">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z" />
              </svg>
            </div>
          </div>

          <div className="sec-middle">
            <input
              id="note-text"
              className="searchID iNote tTitle"
              type="text"
              placeholder="Take a note..."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="reminder-row">
              <label className="reminder-toggle">
                <input
                  id="note-reminder-active"
                  type="checkbox"
                  checked={reminderActive}
                  onChange={(event) => setReminderActive(event.target.checked)}
                />
                Set reminder
              </label>
              <input
                id="note-reminder-datetime"
                className="reminder-datetime"
                type="datetime-local"
                disabled={!reminderActive}
                value={reminderDateTime}
                onChange={(event) => setReminderDateTime(event.target.value)}
              />
            </div>
          </div>

          <div className="sec-bottom">
            <div className="tool-box">
              <div className="input-tools toolsDark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M80 0v-160h800V0H80Zm140-280 210-560h100l210 560h-96l-50-144H368l-52 144h-96Zm176-224h168l-82-232h-4l-82 232Z" />
                </svg>
              </div>
              <div className="input-tools toolsDark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-177 23q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm120-160q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm200 0q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm120 160q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z" />
                </svg>
              </div>
              <div className="input-tools toolsDark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M440-360h80v-80h80v-80h-80v-80h-80v80h-80v80h80v80ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                </svg>
              </div>
              <div className="input-tools toolsDark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-640Zm0 400Z" />
                </svg>
              </div>
              <div className="input-tools toolsDark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
                </svg>
              </div>
              <div className="input-tools toolsDark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="m480-240 160-160-56-56-64 64v-168h-80v168l-64-64-56 56 160 160ZM200-640v440h560v-440H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm264 300Z" />
                </svg>
              </div>
              <div className="input-tools toolsDark">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                </svg>
              </div>
            </div>
            <div className="close-btn">
              <button type="button" className="searchID" onClick={closeActiveForm}>
                Close
              </button>
            </div>
          </div>
        </form>
      </div>

      <div id="upcoming-reminders" className="upcoming-reminders">
        <h3>Upcoming reminders</h3>
        <div className="upcoming-items">
          {upcomingReminders.length === 0 ? (
            <div className="upcoming-empty">No upcoming reminders</div>
          ) : (
            upcomingReminders.map((note) => (
              <div className="upcoming-item" key={note.id}>
                <strong>{note.title || "Untitled note"}</strong>
                <span>{formatReminderLabel(note.reminderDateTime)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="displayed-notes notes note">
        {notes.length === 0 ? (
          <div className="notes-empty">No notes yet</div>
        ) : (
          notes.map((note) => (
            <div
              className="notes-box border note"
              key={note.id}
              onClick={() => openEditModal(note)}
              style={{ backgroundColor: note.color || undefined }}
            >
              <div className="notes-top">
                <div className="check">
                  <svg className="checkMark" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
                    <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </div>
                <div className="note-input">
                  <input className="searchID" type="text" value={note.title} readOnly placeholder="Untitled note" />
                </div>
                <div className="pin-note toolsDark" onClick={(event) => event.stopPropagation()}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#65696D">
                    <path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z" />
                  </svg>
                </div>
              </div>
              {note.text && (
                <div className="note-body">
                  {note.text}
                </div>
              )}
              <div className="notes-bottom">
                <div className="notes-tools toolsDark">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-177 23q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm120-160q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm200 0q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm120 160q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z" />
                  </svg>
                </div>
                <div className="notes-tools toolsDark">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="M440-360h80v-80h80v-80h-80v-80h-80v80h-80v80h80v80ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                  </svg>
                </div>
                <div className="notes-tools toolsDark">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-640Zm0 400Z" />
                  </svg>
                </div>
                <div className="notes-tools toolsDark">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
                  </svg>
                </div>
                <div className="notes-tools color" onClick={(event) => {
                    event.stopPropagation();
                    toggleNoteColor(note.id);
                  }}>
                  <div
                    className="color-swatch"
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "#F39F76",
                      border: "1px solid rgba(255,255,255,0.8)",
                    }}
                  />
                </div>
                <div className="notes-tools toolsDark">
                  <button
                    type="button"
                    className="archive-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteNote(note.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m480-240 160-160-56-56-64 64v-168h-80v168l-64-64-56 56 160 160ZM200-640v440h560v-440H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm264 300Z"/></svg>
                  </button>
                </div>
                <div className="notes-tools toolsDark">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>
                </div>
              </div>
              {note.reminderActive && note.reminderDateTime && (
                <div className="note-reminder">
                  Reminder: {formatReminderLabel(note.reminderDateTime)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        note={editingNote}
        onClose={closeEditModal}
        onSave={saveEditedNote}
      />

      <div id="toast-container" className="toast-container">
        {toasts.map((toast) => (
          <div className="toast visible" key={toast.id}>
            {toast.message}
          </div>
        ))}
      </div>
    </section>

  );
}

export default Forms;