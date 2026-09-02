import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Redirect localStorage token operations to sessionStorage to isolate sessions per tab
const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

window.localStorage.getItem = (key) => {
  if (key === 'token') {
    return window.sessionStorage.getItem('token');
  }
  return originalGetItem(key);
};

window.localStorage.setItem = (key, value) => {
  if (key === 'token') {
    window.sessionStorage.setItem('token', value);
    return;
  }
  originalSetItem(key, value);
};

window.localStorage.removeItem = (key) => {
  if (key === 'token') {
    window.sessionStorage.removeItem('token');
    return;
  }
  originalRemoveItem(key);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

