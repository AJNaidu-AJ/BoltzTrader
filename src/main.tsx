import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryProvider } from "./providers/QueryProvider";
import { initSentry } from "./lib/sentry";
import { notificationService } from "./services/notificationService";
import "./index.css";

// Initialize Sentry
initSentry();

// Initialize notification service
notificationService.initialize();

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
);
