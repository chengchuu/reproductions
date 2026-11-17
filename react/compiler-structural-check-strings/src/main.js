import { $structuralCheck } from '../.cache/runtime.mjs';

const results = [];

for (const [label, before, after, expected] of [
  ['ordinary strings', 'before', 'after', 1],
  ['numeric strings', '1', '2', 1],
  ['NaN values', NaN, NaN, 0],
]) {
  const diagnostics = [];
  const originalError = console.error;
  try {
    console.error = (...args) => diagnostics.push(args);
    $structuralCheck(before, after, 'value', 'Example', label, '1:1');
  } finally {
    console.error = originalError;
  }
  results.push(`${label.padEnd(16)}: expected=${expected} actual=${diagnostics.length} diagnostics`);
}

document.getElementById('results').textContent = results.join('\n');
