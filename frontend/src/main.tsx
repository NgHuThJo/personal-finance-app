import React from "react";
import ReactDOM from "react-dom/client";
import { Context } from "./providers/context";
import { Router } from "./app/router";
import "#frontend/assets/styles";

const root = document.getElementById("root");

if (!root) {
  throw new ReferenceError("DOM root not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Context>
      <Router />
    </Context>
  </React.StrictMode>,
);
