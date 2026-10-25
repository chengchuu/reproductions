import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SignedZero } from './SignedZero.jsx';

function App() {
  'use no memo';
  const [condition, setCondition] = useState(true);
  return (
    <main>
      <h1>React Compiler signed-zero reproduction</h1>
      <button onClick={() => setCondition(value => !value)}>Toggle condition</button>
      <p>Condition: {String(condition)}</p>
      <p>Expected: {condition ? 'Infinity' : '-Infinity'}</p>
      <p>Compiled result: <SignedZero condition={condition} /></p>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
