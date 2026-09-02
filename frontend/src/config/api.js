// Dynamic API Base URL resolution for local network IP & mobile access
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000");
