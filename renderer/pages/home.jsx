import Head from "next/head";
import toast from "react-hot-toast";
import bookStyles from "../styles/Book.module.css";

import { useState, useEffect, Fragment } from "react";

function Book({ title, author, id, mirror }) {
  const handleClick = () => {
    return new Promise((resolve, reject) => {
      try {
        const hash = mirror.split("/").pop();
        console.log(hash);
        console.log(title);
        window.ipc.send("run-sh", `read_book ${id} ${hash} ${title}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <div className={bookStyles.book}>
      <h2>{title}</h2>
      <p>{author}</p>
      <button
        onClick={() => {
          toast.promise(handleClick(), {
            loading: "Pinging Server...",
            success: "Pinged successfully. Please wait while I'm working...",
            error: "Failed to ping. Please try again.",
          });
        }}
      >
        Generate Audiobook
      </button>
    </div>
  );
}

function LogModal({ log, onClose, isVisible, setIsVisible }) {
  useEffect(() => {
    setIsVisible(true); // Show the modal when it mounts
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Hide the modal when closed
    onClose(); // Call the onClose function passed from the parent component
  };
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "50px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            padding: "5px 10px",
            backgroundColor: "lightgray",
            borderRadius: "50%",
            fontSize: "18px",
          }}
        >
          X
        </span>
        <div style={{ marginBottom: "10px" }}>
          {new Date().toLocaleTimeString()}
        </div>
        <code style={{ overflow: "auto", maxHeight: "200px" }}>{log}</code>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [log, setLog] = useState("No Logs");
  const [input, setInput] = useState("");
  const [books, setBooks] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [audiobookPath, setAudiobookPath] = useState("");

  const handleClick = () => {
    window.ipc.send("run-sh", `fetch_books ${input}`);
  };

  const handleLog = (log) => {
    setLog(log);
  };

  const handleBooks = (msg) => {
    try {
      console.log(msg);
      const bks = JSON.parse(msg);
      setBooks(bks);
    } catch (error) {
      console.error("Error parsing books data:", error);
    }
  };

  const handleBookDone = (msg) => {
    console.log("Book finished:", msg);
    setAudiobookPath(msg);
  };

  const ipcs = {
    log: handleLog,
    book: handleBooks,
    book_done: handleBookDone,
  };

  useEffect(() => {
    for (let key in ipcs) {
      // Create event listener for each IPC channel
      window.ipc.on(key, ipcs[key]);
    }

    // Cleanup
    return () => {
      if (!window.ipc.removeListener) return;

      for (let key in ipcs) {
        window.ipc.removeListener(key, ipcs[key]);
      }
    };
  }, []);

  return (
    <Fragment>
      <Head>
        <title>Library Genesis Reader</title>
      </Head>
      <div>
        <span
          onClick={() => setShowLog(true)}
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            cursor: "pointer",
            padding: "5px",
            backgroundColor: "lightgray",
            borderRadius: "5px",
          }}
        >
          📜 Show Logs
        </span>
        <h1>Library-Genesis Reader 📖</h1>
        <div>
          This tool turns any book into an audiobook using various TTS engines,
          such as:
          <ul>
            <li>Google Text-to-Speech</li>
            <li>Edge TTS</li>
            <li>ElevenLabs</li>
          </ul>
        </div>
        {showLog && (
          <LogModal
            log={log}
            isVisible={showLog}
            setIsVisible={setShowLog}
            onClose={() => setShowLog(false)}
          />
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleClick}>Search</button>
      </div>
      {audiobookPath && (
        <div>
          <h2>Audiobook Path:</h2>
          <a href={audiobookPath} download>
            {audiobookPath}
          </a>
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        {books.map((book, index) => (
          <Book
            key={index}
            id={book.ID}
            title={book.Title}
            author={book.Author}
            mirror={book.Mirror_1}
          />
        ))}
      </div>
    </Fragment>
  );
}
