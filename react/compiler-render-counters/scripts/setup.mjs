import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repository = 'https://github.com/react/react.git';
const commit = 'df6aa4ec76cff5b3adde531c6fe8c36099e0469b';
const source = path.join(root, '.cache/react');
const run = (args) => execFileSync('git', args, { cwd: source, stdio: 'inherit' });

mkdirSync(source, { recursive: true });
if (!existsSync(path.join(source, '.git'))) {
  run(['init']);
  run(['remote', 'add', 'origin', repository]);
} else {
  run(['remote', 'set-url', 'origin', repository]);
}
run(['fetch', '--depth=1', '--filter=blob:none', 'origin', commit]);
run([
  'sparse-checkout',
  'set',
  'compiler/packages/react-compiler-runtime',
]);
run(['checkout', '--detach', commit]);

await build({
  entryPoints: [path.join(source, 'compiler/packages/react-compiler-runtime/src/index.ts')],
  outfile: path.join(root, '.cache/runtime.mjs'),
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2020',
  external: ['react'],
  tsconfigRaw: {},
});
console.log(`Built react-compiler-runtime from ${commit}.`);
