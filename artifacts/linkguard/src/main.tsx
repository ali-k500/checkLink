import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply dark mode and RTL to root HTML element
document.documentElement.classList.add("dark");
document.documentElement.setAttribute("dir", "rtl");
document.documentElement.setAttribute("lang", "ar");

// Load Cairo Arabic font
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap";
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(<App />);
