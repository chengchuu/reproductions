import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import { transformSync } from '@babel/core';
import { transformSync as transformJSX } from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { compiler } from './compiler.mjs';

const input = new URL('../src/SignedZero.jsx', import.meta.url);
const source = readFileSync(input, 'utf8');
const compiled = transformSync(source, {
  filename: fileURLToPath(input),
  babelrc: false,
  configFile: false,
  parserOpts: { plugins: ['jsx'] },
  plugins: [[compiler, { panicThreshold: 'all_errors' }]],
}).code;

async function loadComponent(code, name) {
  const output = new URL(`../.cache/${name}.mjs`, import.meta.url);
  writeFileSync(output, transformJSX(code, {
    loader: 'jsx', jsx: 'automatic', format: 'esm',
  }).code);
  return (await import(output.href)).SignedZero;
}
const original = await loadComponent(source, 'original');
const optimized = await loadComponent(compiled, 'compiled');
const conditions = [true, false, true];
const render = (Component, condition) => renderToStaticMarkup(
  createElement(Component, { condition }),
).replace(/^<output>|<\/output>$/g, '');
const expected = conditions.map(condition => render(original, condition));
const actual = conditions.map(condition => render(optimized, condition));
assert.deepEqual(expected, ['Infinity', '-Infinity', 'Infinity']);
for (const [index, condition] of conditions.entries()) {
  console.log(`condition=${condition} expected=${expected[index]} actual=${actual[index]}`);
}
if (actual.every(value => value === 'Infinity')) {
  console.log('Bug reproduced: the compiled result loses the branch-dependent sign.');
} else {
  console.error('The expected bug was not reproduced.');
  process.exitCode = 1;
}
