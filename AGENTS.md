# Contributor guide

## Repository purpose

Each example independently reproduces an upstream bug, with its own fixtures, dependencies, and instructions. There is no root package manifest, shared startup, or repository-wide test runner.

Read the example's `README.md` first. Preserve the bug trigger: a failed build or nonzero server exit may be the expected result.

## Repository map

| Path                                                      | Role                                                                                        |
|:----------------------------------------------------------|:--------------------------------------------------------------------------------------------|
| `README.md`                                               | Example index and links to issue drafts.                                                    |
| `react/compiler-signed-zero/`                             | The TypeScript implementation of the React Compiler loses the sign of negative zero.        |
| `react/rust-compiler-unicode-diagnostic/`                 | Misplaced diagnostic underline in the Rust React Compiler.                                  |
| `typescript/lsp-shutdown-exit-code/`                      | Incorrect LSP exit code after shutdown (#64742).                                            |
| `typescript/lsp-referenced-project-rebuild/`              | Repeated builds of an unrelated referenced project (#64862).                                |
| `typescript/declaration-emit-missing-diagnostic-context/` | Declaration emit panics on a labeled interface (#64666).                                    |
| `typescript/assignment-through-type-assertion/`           | A write through a type assertion incorrectly reports TS2454 (#62127).                       |
| `docs/issues/`                                            | Issue drafts with reproduction details.                                                     |
| `.gitignore`                                              | Excludes dependencies, caches, build output, native binaries, and the copied React license. |

## React: setup and build flow

Both React examples use Yarn Classic (`package.json` and `yarn.lock`), Node `^20.19.0 || >=22.12.0`, and Git. Run commands from the individual example's directory. A fresh clone requires `yarn install` and `yarn setup` before reproduction or Vite commands.

Each `scripts/setup.mjs` fetches a pinned React commit into `.cache/react` with `--depth=1 --filter=blob:none` and uses sparse checkout. Setup reuses caches but fetches on every run. Keep each script's source revision consistent with its README and issue draft.

### Signed zero

From `react/compiler-signed-zero/`:

```bash
yarn install
yarn setup
yarn repro
```

`scripts/setup.mjs` checks out `compiler/packages/babel-plugin-react-compiler` and bundles its TypeScript entry point with esbuild into `.cache/compiler.cjs`. Dependencies remain external and resolve from the example's installed packages. This example does not require Rust; “TypeScript React Compiler” refers to React's compiler implementation, not the TypeScript language compiler.

`scripts/compiler.mjs` loads the built compiler and reports a missing setup step if the bundle is absent. Both `scripts/repro.mjs` and `vite.config.js` use it through Babel with `panicThreshold: 'all_errors'`.

`yarn repro` reads `src/SignedZero.jsx`, compiles it, and uses esbuild to lower JSX in both the original and compiled versions into `.cache/*.mjs`. It compares server-rendered output for `true`, `false`, and `true`. The original returns `Infinity`, `-Infinity`, and `Infinity`; the affected compiler returns `Infinity` for all three. Exit 0 means the bug reproduced; a nonzero exit means the expected bug was absent or setup or execution failed.

For the browser example, `index.html` loads `src/main.jsx`, which renders `SignedZero`. The wrapper uses `'use no memo'` and shows the expected result beside the compiled result. Run `yarn dev` and click **Toggle condition**. `yarn build` creates the Vite production build; `yarn preview` serves it. A successful build alone does not verify the bug.

### Rust compiler Unicode diagnostic

From `react/rust-compiler-unicode-diagnostic/`:

```bash
yarn install
yarn setup
yarn build
```

This example also requires Rust/Cargo and native build tools. Set `CARGO` to override the Cargo executable.

`yarn setup` runs `scripts/setup.mjs`, which:

1. Fetches the pinned React commit into `.cache/react` with `--depth=1 --filter=blob:none`, uses sparse checkout for `compiler/` and root files, and links the example's Node dependencies.
2. Compiles the Babel adapter with TypeScript and builds `react_compiler_napi` with Cargo's `--locked` flag into `.cache/target`.
3. Copies the adapter output, native library (`native/index.node`), and upstream license into `vendor/babel-plugin-react-compiler-rust/`.

The setup script selects the native library filename for macOS, Linux, or Windows and rejects other platforms. Platform selection in the script does not establish that reproduction has been tested on each platform.

`yarn build` runs Vite with `vite.config.js`. Source passes through Babel and the native Rust compiler; diagnostics return through the adapter to the terminal. With `panicThreshold: 'all_errors'`, the intentional props mutation fails the build. Check the underline position, and keep `"café"` and the mutation on the same line.

The browser entry is `index.html` → `src/main.jsx` → `createRoot`. `yarn dev` starts Vite; `yarn preview` serves build output.

## TypeScript: setup and data flow

All four examples use Git and Go 1.27. Follow each README to fetch its pinned revision with `--depth 1` and build `./cmd/tsc` from the upstream `tsc/` module using `GOWORK=off` and `-mod=readonly`. Source and uncached dependencies require network access; binaries go into a temporary build directory. Run the commands from the example's directory and use the native binary built by those commands.

Only the two LSP examples require Python 3.8 or later. Their clients use only the standard library. They launch `tsc --lsp --stdio`, exchange JSON-RPC messages with `Content-Length` headers, and answer server requests while waiting for responses. The other two examples contain only `README.md` and `min.ts`; they need no Python client, npm dependencies, or `tsconfig.json`.

### Shutdown exit code

From `typescript/lsp-shutdown-exit-code/`, after building the binary:

```bash
PATH="$build_dir/bin:$PATH" python3 repro.py
```

`repro.py` selects `tsc` from `PATH` and uses the current directory as its workspace. It initializes the server, waits for the shutdown response, then sends exit. Keep stdin open so EOF cannot mask the bug.

`tsconfig.json` contains `{}`, so default file discovery applies; it does not define an empty project. Opening a document is optional. Given a document URI, the script sends hard-coded text (`const x = 1;`) rather than reading the file.

The affected server prints `context canceled` and exits 1. The script prints that status but does not use it as its own exit status. Ensure `PATH` selects the native binary built above, not the JavaScript TypeScript CLI.

### Referenced project rebuild

From `typescript/lsp-referenced-project-rebuild/`, after building the binary:

```bash
python3 repro.py --tsc "$build_dir/bin/tsc" --log "$build_dir/server.log"
```

`repro.py` resolves the workspace from its own location; `--log` optionally saves server logs. The solution `tsconfig.json` references `tsconfig.app.json` (`src/`) and `tsconfig.node.json` (`vite.config.ts`). No Vite installation is needed.

A reader thread queues messages. With debug logging enabled, the client opens each source file, waits for a nonempty `textDocument/documentSymbol` response, and closes it. After shutdown, it closes stdin to avoid testing exit-notification behavior.

The script counts unrelated project creations, completed program updates, and deletions in server logs, matching paths case-insensitively. It exits 0 when each count reaches at least three, or 1 if the pattern is absent or execution fails. This check depends on log wording and does not measure large-project performance.

### Declaration emit missing diagnostic context

From `typescript/declaration-emit-missing-diagnostic-context/`, after building the binary:

```bash
"$build_dir/bin/tsc" --declaration --pretty false --outDir "$build_dir/out" min.ts
echo "Exit code: $?"
```

`min.ts` declares a labeled interface and exports another interface extending it. The affected compiler prints `panic: Diagnostic emitted without context [recovered, repanicked]`, followed by a stack trace, and exits 2. Invalid input should produce diagnostics without crashing. Keep `--declaration`: the bug occurs during declaration emit. Emitted files stay in the temporary output directory.

### Assignment through a type assertion

From `typescript/assignment-through-type-assertion/`, after building the binary:

```bash
"$build_dir/bin/tsc" --strict --noEmit --pretty false min.ts
echo "Exit code: $?"
```

`min.ts` assigns `1` through `(value as number)` to an uninitialized local variable. The affected compiler reports `min.ts(3,4): error TS2454: Variable 'value' is used before being assigned.` and exits 2. The assignment does not read the variable, so the code should be accepted. Preserve `--strict` and the type assertion; `--noEmit` avoids generating output beside the fixture.

## Making changes

- Check `git status` and preserve unrelated work, including untracked examples.
- Add examples under the upstream project's directory and link them from the root README.
- Pin affected revisions and keep fixtures, commands, expected output, and issue drafts consistent.
- Follow each example's dependency and formatting conventions. Avoid unrelated framework or package-manager changes.
- Edit setup scripts or source inputs, not generated adapters or binaries. Keep generated files out of commits.
- Preserve issue links, attribution, exact errors, and the distinction between actual and expected behavior.

## README and issue writing style

- Keep each example concise, natural, and understandable in under 60 seconds. Use direct language and avoid repeating what the commands or output already show.
- Focus on reproducing the issue. Do not add fix comparisons or fix-validation instructions unless requested.
- Lead with the issue link and a brief description of the bug, followed by reproduction commands and expected output.
- Write reproduction steps for project contributors. Omit routine prerequisite introductions such as “With Node.js, Yarn Classic, and Git installed.” Mention unusual setup requirements or version constraints only when needed to reproduce or interpret the issue.
- Use “To reproduce:” as a short transition when there is no reproduction heading. Under a heading such as `## Steps To Reproduce`, start directly with the commands or steps; do not repeat “To reproduce:”.
- Match issue-draft heading levels to the destination form field. For React compiler content pasted into GitHub’s `### Repro steps` field, use `#### Steps To Reproduce`, `#### The current behavior`, and `#### The expected behavior`; use `#####` for subsections such as `Playground` and `Reproduction repository`. Keep the local issue title as H1. Do not apply these nested levels to standalone READMEs or unrelated issue templates.
- Keep tested environment details in issue reports as validation evidence, separate from setup instructions.
- Omit validation history, repeated-run summaries, and control experiments from the README unless they are needed to understand or reproduce the issue. Keep relevant evidence in the task report or issue draft.
- Explain exit codes when success means the bug reproduced or when the script's status differs from the program's status. Retain limitations that affect interpretation of the result.
- Preserve commands, identifiers, URLs, pinned revisions, exact output, and documented behavior during wording edits.

## Validation

Run the affected example and compare its output with its README. Shell success alone is insufficient: the Unicode example's Vite build fails intentionally, the signed-zero and project-rebuild scripts succeed when they detect their bugs, and the shutdown script prints the server's failure. Both standalone TypeScript compiler examples exit 2, but only the declaration-emit example should panic. In their README command blocks, the final `echo` reports the compiler's status while returning success itself.

Record the revision, OS/architecture, tool versions, commands, and results in the task report or issue draft as appropriate; a README does not need a validation section. Distinguish source-archive builds from verified clone instructions; report only tested platforms and measured behavior.

For prose-only changes, check paths, commands, Markdown, and the final diff without rebuilding upstream projects. There is no root lint or format command. Use `git diff --check` for tracked changes and inspect new files separately.
