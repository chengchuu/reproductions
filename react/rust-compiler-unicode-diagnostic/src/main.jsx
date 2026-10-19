import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function App(props) {
  const text = "café"; props.value = text;
  return <h1>{props.value}</h1>;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App value="Hello" />
  </StrictMode>,
);
