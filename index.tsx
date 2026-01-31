import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("CRITICAL_FAILURE: Root element missing from DOM.");
} else {
  try {
    // Remove the boot loader text once JS takes over
    const loader = document.getElementById('boot-loader');
    if (loader) loader.remove();

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("SHADOW_PROTOCOL: System online.");
  } catch (error) {
    console.error("SHADOW_PROTOCOL: Initialization failed:", error);
    rootElement.innerHTML = `<div style="color: #8a0303; font-family: monospace; padding: 20px;">FAILED_TO_BOOT: Check console logs for frequency interference.</div>`;
  }
}