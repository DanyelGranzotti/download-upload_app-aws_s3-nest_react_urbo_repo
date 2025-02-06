import { Theme, ThemePanel } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";
import Download from "./pages/Download.tsx";
import Upload from "./pages/Upload.tsx";

import "@radix-ui/themes/styles.css";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Theme>
        <Routes>
          <Route path="/*" element={<App />} />7
          <Route path="/download" element={<Download />} />7
          <Route path="/upload" element={<Upload />} />
        </Routes>
        <ThemePanel />
      </Theme>
    </BrowserRouter>
  </StrictMode>
);
