<<<<<<< Updated upstream
import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
=======
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
>>>>>>> Stashed changes

  return (
    <>
      <section id="center">
        <div className="hero">
<<<<<<< Updated upstream
          <img alt="" className="base" height="179" src={heroImg} width="170" />
          <img alt="React logo" className="framework" src={reactLogo} />
          <img alt="Vite logo" className="vite" src={viteLogo} />
=======
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
>>>>>>> Stashed changes
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

<<<<<<< Updated upstream
      <div className="ticks" />

      <section id="next-steps">
        <div id="docs">
          <svg aria-hidden="true" className="icon" role="presentation">
            <use href="/icons.svg#documentation-icon" />
=======
      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
>>>>>>> Stashed changes
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
<<<<<<< Updated upstream
              <a href="https://vite.dev/" rel="noopener" target="_blank">
                <img alt="" className="logo" src={viteLogo} />
=======
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
>>>>>>> Stashed changes
                Explore Vite
              </a>
            </li>
            <li>
<<<<<<< Updated upstream
              <a href="https://react.dev/" rel="noopener" target="_blank">
                <img alt="" className="button-icon" src={reactLogo} />
=======
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
>>>>>>> Stashed changes
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
<<<<<<< Updated upstream
          <svg aria-hidden="true" className="icon" role="presentation">
            <use href="/icons.svg#social-icon" />
=======
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
>>>>>>> Stashed changes
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
<<<<<<< Updated upstream
              <a
                href="https://github.com/vitejs/vite"
                rel="noopener"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation"
                >
                  <use href="/icons.svg#github-icon" />
=======
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
>>>>>>> Stashed changes
                </svg>
                GitHub
              </a>
            </li>
            <li>
<<<<<<< Updated upstream
              <a href="https://chat.vite.dev/" rel="noopener" target="_blank">
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation"
                >
                  <use href="/icons.svg#discord-icon" />
=======
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
>>>>>>> Stashed changes
                </svg>
                Discord
              </a>
            </li>
            <li>
<<<<<<< Updated upstream
              <a href="https://x.com/vite_js" rel="noopener" target="_blank">
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation"
                >
                  <use href="/icons.svg#x-icon" />
=======
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
>>>>>>> Stashed changes
                </svg>
                X.com
              </a>
            </li>
            <li>
<<<<<<< Updated upstream
              <a
                href="https://bsky.app/profile/vite.dev"
                rel="noopener"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation"
                >
                  <use href="/icons.svg#bluesky-icon" />
=======
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
>>>>>>> Stashed changes
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

<<<<<<< Updated upstream
      <div className="ticks" />
      <section id="spacer" />
    </>
  );
}

export default App;
=======
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
>>>>>>> Stashed changes
