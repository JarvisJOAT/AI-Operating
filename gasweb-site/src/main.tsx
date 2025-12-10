/**
 * Main Entry Point for GasWeb.info
 * 
 * This file bootstraps the React application and mounts it to the DOM.
 * It sets up the root component with strict mode for development.
 * 
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Root element where the React app will be mounted.
 * Throws an error if the element is not found.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find root element. Make sure there is a <div id="root"></div> in your index.html'
  );
}

/**
 * Create and render the React application root.
 * StrictMode enables additional development checks.
 */
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

