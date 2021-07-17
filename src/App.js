import React, { useEffect, useState, useRef } from "react";
import Excalidraw, { exportToBlob } from "@excalidraw/excalidraw";
import axios from 'axios';
import dotenv from 'dotenv';

import "./App.css";

dotenv.config();

export default function App() {
  const excalidrawRef = useRef(null);
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [period, setPeriod] = useState(Date.now() + 1000);
  const [prevElements, setPrevElements] = useState({});
  const [prevState, setPrevState] = useState({});
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const libraryUrl = hash.get("addLibrary");
      if (libraryUrl) {
        excalidrawRef.current.importLibrary(libraryUrl, hash.get("token"));
      }
    };
    window.addEventListener("hashchange", onHashChange, false);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const uploadPNGToServer = async (elements, state) => {
    const blob = await exportToBlob({
      elements: elements,
      mimeType: "image/png",
      appState: state
    });
    const myFile = new File([blob], "image.png", {
      type: blob.type,
    });
    let formData = new FormData();
    formData.append("file", myFile);
    try {
      await axios.post(process.env.REACT_APP_SERVER_UPLOAD_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  const upload = async (elements, state) => {
    let timer;
    if ((period < Date.now() && elements !== prevElements && state !== prevState)) {
      setPrevElements(elements);
      setPrevState(state); 
      uploadPNGToServer(elements, state);
      setPeriod(Date.now() + 10000);
      setShowSaved(true);
       timer = setTimeout(() => {
        setShowSaved(false);
      }, 500);
    }
    return () => {
      clearTimeout(timer);
    }
  }

  return (
    <div className="App">
      <h1> Excalidraw Example</h1>
      <div className="button-wrapper">
        <button
          className="reset-scene"
          onClick={() => {
            excalidrawRef.current.resetScene();
          }}
        >
          Reset Scene
        </button>
        <label>
          <input
            type="checkbox"
            checked={viewModeEnabled}
            onChange={() => setViewModeEnabled(!viewModeEnabled)}
          />
          View mode
        </label>
        <label>
          <input
            type="checkbox"
            checked={zenModeEnabled}
            onChange={() => setZenModeEnabled(!zenModeEnabled)}
          />
          Zen mode
        </label>
        <label>
          <input
            type="checkbox"
            checked={gridModeEnabled}
            onChange={() => setGridModeEnabled(!gridModeEnabled)}
          />
          Grid mode
        </label>
        <label>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => {
              let newTheme = "light";
              if (theme === "light") {
                newTheme = "dark";
              }
              setTheme(newTheme);
            }}
          />
          Switch to Dark Theme
        </label>
      </div>
      <div className="excalidraw-wrapper">
        <Excalidraw
          ref={excalidrawRef}
          onChange={(elements, state) =>
            upload(elements, state)
          }
          onCollabButtonClick={() =>
            window.alert("You clicked on collab button")
          }
          viewModeEnabled={viewModeEnabled}
          zenModeEnabled={zenModeEnabled}
          gridModeEnabled={gridModeEnabled}
          theme={theme}
          name="Custom name of drawing"
          UIOptions={{ canvasActions: { loadScene: false } }}
        />
      </div>
      { showSaved && <h3 className="info">Saved...!</h3>}
    </div>
  );
}
