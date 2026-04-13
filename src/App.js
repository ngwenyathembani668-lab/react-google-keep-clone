
import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Forms from "./Forms";
import Modal from "./Modal";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <Navbar
        onThemeToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        themeIcon={theme === "dark" ? "🌞" : "🌙"}
      />

      <main>

      <Sidebar />

      <Forms />

      <Modal />

      </main>
    </>
  );
}

export default App;