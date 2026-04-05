import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <section style={{ textAlign: "center", maxWidth: "48rem" }}>
<<<<<<< Updated upstream
        <p
          style={{
            marginBottom: "0.75rem",
            fontSize: "0.875rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
=======
        <p style={{ marginBottom: "0.75rem", fontSize: "0.875rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>
>>>>>>> Stashed changes
          walkscore-bg
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          Sports Dashboard
        </h1>
<<<<<<< Updated upstream
        <p
          style={{
            marginTop: "1rem",
            fontSize: "1.125rem",
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
=======
        <p style={{ marginTop: "1rem", fontSize: "1.125rem", lineHeight: 1.6, opacity: 0.8 }}>
>>>>>>> Stashed changes
          Scaffold complete. Start building the TanStack Start app from here.
        </p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
<<<<<<< Updated upstream
  </React.StrictMode>
=======
  </React.StrictMode>,
>>>>>>> Stashed changes
);
