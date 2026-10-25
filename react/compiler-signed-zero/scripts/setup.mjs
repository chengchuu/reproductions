import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const commit = '9ffcb463b0ab01a42e781d4dc2e00f3a1b97a188';
const repository = 'https://github.com/react/react.git';
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
run(['sparse-checkout', 'set', 'compiler/packages/babel-plugin-react-compiler']);
run(['checkout', '--detach', commit]);

await build({
  entryPoints: [path.join(source, 'compiler/packages/babel-plugin-react-compiler/src/index.ts')],
  outfile: path.join(root, '.cache/compiler.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  packages: 'external',
  tsconfigRaw: {},
});
console.log(`Built the TypeScript React Compiler from ${commit}.`);
