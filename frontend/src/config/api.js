// Dynamic API Base URL resolution for production, local network IP & mobile access
const envUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (() => {
  if (envUrl && envUrl.trim() !== "") {
    let cleanUrl = envUrl.trim().replace(/\/+$/, ""); // Remove trailing slashes
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`; // Ensure protocol is present so browser treats it as absolute URL
    }
    return cleanUrl;
  }
  
  if (typeof window !== "undefined" && window.location.hostname) {
    const isLocalhost = 
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1" || 
      window.location.hostname.startsWith("192.168.") || 
      window.location.hostname.startsWith("10.");
      
    if (isLocalhost) {
      return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
  }
  
  return "http://localhost:3000";
})();
