import { useEffect, useRef, useState } from 'react';
import { renderCounterRegistry, useRenderCounter } from 'react-compiler-runtime';

export function App() {
  const [updates, setUpdates] = useState(0);
  const log = useRef(null);
  useRenderCounter('App');

  useEffect(() => {
    // Observe after the counter's effect without triggering another render.
    const registered = renderCounterRegistry.get('App')?.size ?? 0;
    log.current.textContent += `Updates: ${updates}; registered counters: ${registered}\n`;
  }, [updates]);

  return (
    <main>
      <h1>React Compiler render counter registration</h1>
      <p>Expected: one registered counter while this component is mounted.</p>
      <button onClick={() => setUpdates(updates + 1)}>Update component: {updates}</button>
      <pre ref={log} aria-live="polite" />
    </main>
  );
}
