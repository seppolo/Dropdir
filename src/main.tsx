import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

// Use deferred loading for non-critical resources
const deferredLoad = () => {
  // Any additional resources that can be loaded after initial render
};

// Render the app immediately
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>,
);

// Schedule deferred loading
if (window.requestIdleCallback) {
  window.requestIdleCallback(deferredLoad);
} else {
  setTimeout(deferredLoad, 1000);
}
