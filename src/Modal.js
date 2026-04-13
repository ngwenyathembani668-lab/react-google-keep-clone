import React, { useEffect, useState } from "react";

const formatDateTimeForInput = (date) => {
  if (!date) return "";
  const pad = (value) => String(value).padStart(2, "0");
  const dateObject = typeof date === "string" ? new Date(date) : date;
  if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
    return "";
  }
  const year = dateObject.getFullYear();
  const month = pad(dateObject.getMonth() + 1);
  const day = pad(dateObject.getDate());
  const hours = pad(dateObject.getHours());
  const minutes = pad(dateObject.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function Modal({ isOpen, note, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState("");

  useEffect(() => {
    if (!isOpen || !note) {
      return;
    }

    setTitle(note.title || "");
    setText(note.text || "");
    setReminderActive(Boolean(note.reminderActive));
    setReminderDateTime(formatDateTimeForInput(note.reminderDateTime));
  }, [isOpen, note]);

  const handleSaveAndClose = () => {
    if (!note) {
      onClose();
      return;
    }

    const updatedNote = {
      ...note,
      title: title.trim(),
      text: text.trim(),
      reminderActive,
      reminderDateTime:
        reminderActive && reminderDateTime ? new Date(reminderDateTime) : null,
    };

    onSave(updatedNote);
    onClose();
  };

  if (!isOpen || !note) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleSaveAndClose}>
      <div id="modal-box" className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div>
          <form id="modal-form" className="modal border active-form">
            <div className="sec-top">
              <div className="title-input">
                <input
                  id="modal-title"
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
                id="modal-text"
                className="searchID iNote tTitle"
                type="text"
                placeholder="Take a note..."
                value={text}
                onChange={(event) => setText(event.target.value)}
              />

              <div className="reminder-row">
                <label className="reminder-toggle">
                  <input
                    id="modal-reminder-active"
                    type="checkbox"
                    checked={reminderActive}
                    onChange={(event) => setReminderActive(event.target.checked)}
                  />
                  Set reminder
                </label>
                <input
                  id="modal-reminder-datetime"
                  className="reminder-datetime"
                  type="datetime-local"
                  disabled={!reminderActive}
                  value={reminderDateTime}
                  onChange={(event) => setReminderDateTime(event.target.value)}
                />
              </div>
            </div>

            <div id="form-foot" className="sec-bottom">
              <div className="tool-box form-foot">
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
                <button type="button" className="searchID" onClick={handleSaveAndClose}>
                  Close
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Modal;
