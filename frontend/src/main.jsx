import "./utils/global-polyfill";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// ✅ 1. IMPORT CALENDAR CSS *FIRST*
import "react-big-calendar/lib/css/react-big-calendar.css";

// ✅ 2. IMPORT YOUR CUSTOM CSS *SECOND*
import "./index.css";

import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
