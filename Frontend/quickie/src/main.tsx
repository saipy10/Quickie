import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import { PostHogProvider } from "posthog-js/react";

// const options = {
//   api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
// };

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <App />
  </StrictMode>
);
