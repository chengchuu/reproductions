import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const adapter = new URL('../vendor/babel-plugin-react-compiler-rust/', import.meta.url);
if (!existsSync(new URL('dist/index.js', adapter)) || !existsSync(new URL('native/index.node', adapter))) {
  throw new Error('Run yarn setup before using the reproduction.');
}
const compiler = require('babel-plugin-react-compiler-rust').default;
const input = new URL('../src/foo.js', import.meta.url);
const source = readFileSync(input, 'utf8');
const compiled = transformSync(source, {
  filename: fileURLToPath(input),
  babelrc: false,
  configFile: false,
  plugins: [[compiler, { panicThreshold: 'all_errors' }]],
}).code;

mkdirSync(new URL('../.cache/', import.meta.url), { recursive: true });
async function load(code, name) {
  const output = new URL(`../.cache/${name}.mjs`, import.meta.url);
  writeFileSync(output, code);
  return (await import(output.href)).foo;
}
const original = await load(source, 'original');
const optimized = await load(compiled, 'compiled');
function Run({ fn }) {
  return fn();
}
const render = fn => renderToStaticMarkup(createElement(Run, { fn }));
const expected = render(original);
assert.equal(expected, 'caught');
try {
  render(optimized);
} catch (error) {
  if (error instanceof Error) {
    console.error(`${error.name}: ${error.message}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
