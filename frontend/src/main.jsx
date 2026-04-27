import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Use the env variable or fallback
const clientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "470572371858-2uktu4o3905om6tqsabv1gn35i3t4m4v.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>,
);
