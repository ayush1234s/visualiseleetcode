const localBackendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

// Production builds use the deployed Render API. Local development can keep
// using VITE_BACKEND_URL from frontend/.env (typically http://localhost:5000).
export const API_BASE_URL = import.meta.env.PROD
  ? "https://visualiseleetcode.onrender.com"
  : localBackendUrl || "http://localhost:5000";
