import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const compilerPath = new URL('../.cache/compiler.cjs', import.meta.url);
if (!existsSync(compilerPath)) {
  throw new Error('Run yarn setup before using the reproduction.');
}
export const compiler = require(fileURLToPath(compilerPath)).default;
