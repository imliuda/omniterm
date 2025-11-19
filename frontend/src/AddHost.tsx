import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme } from "./themes";
import AddHostWindow from "./components/assets/AddHostWindow.tsx";

// Get parent node ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const parentId = urlParams.get("parentId");

// Use unified theme
const theme = lightTheme;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AddHostWindow parentId={parentId || undefined} />
    </ThemeProvider>
  </React.StrictMode>,
);
