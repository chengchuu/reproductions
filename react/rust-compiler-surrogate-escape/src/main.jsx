import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  'use memo';
  const text = "\\\uD800";
  return <p>{text.length}</p>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
