import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const commit = 'b74939d79055ec2f82364cf14089a15f5f3a95bc';
const source = path.join(root, '.cache/react');
const target = path.join(root, '.cache/target');
const run = (command, args, cwd = root) => execFileSync(command, args, { cwd, stdio: 'inherit' });

if (!existsSync(path.join(source, '.git'))) {
  mkdirSync(source, { recursive: true });
  run('git', ['init', source]);
  run('git', ['remote', 'add', 'origin', 'https://github.com/chengchuu/react.git'], source);
}
run('git', ['fetch', '--depth=1', '--filter=blob:none', 'origin', commit], source);
run('git', ['sparse-checkout', 'set', 'compiler'], source);
run('git', ['checkout', '--detach', commit], source);

const compiler = path.join(source, 'compiler');
const dependencies = path.join(compiler, 'node_modules');
if (!existsSync(dependencies)) {
  symlinkSync(path.join(root, 'node_modules'), dependencies, process.platform === 'win32' ? 'junction' : 'dir');
}
const adapter = path.join(compiler, 'packages/babel-plugin-react-compiler-rust');
run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--project', path.join(adapter, 'tsconfig.json')]);
run(process.env.CARGO || 'cargo', ['build', '--locked', '-p', 'react_compiler_napi', '--target-dir', target], compiler);

const library = {
  darwin: 'libreact_compiler_napi.dylib',
  linux: 'libreact_compiler_napi.so',
  win32: 'react_compiler_napi.dll',
}[process.platform];
if (!library) throw new Error(`Unsupported platform: ${process.platform}`);
const vendor = path.join(root, 'vendor/babel-plugin-react-compiler-rust');
cpSync(path.join(adapter, 'dist'), path.join(vendor, 'dist'), { recursive: true });
mkdirSync(path.join(vendor, 'native'), { recursive: true });
copyFileSync(path.join(target, 'debug', library), path.join(vendor, 'native/index.node'));
copyFileSync(path.join(source, 'LICENSE'), path.join(vendor, 'LICENSE'));
console.log(`Built the original Rust compiler at ${commit}. Run yarn build to see the diagnostic.`);
