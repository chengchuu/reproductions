# Contributor guide

## Repository purpose

Each example independently reproduces an upstream bug, with its own fixtures, dependencies, and instructions. This guide applies throughout the repository; there are no example-specific `AGENTS.md` files. There is no root package manifest, shared startup, or repository-wide test runner.

Read the example's `README.md` first. Preserve the bug trigger: a failed build or nonzero server exit may be the expected result.

## Repository map

| Path                                                      | Role                                                                                                     |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `README.md`                                               | Example index.                                                                                           |
| `react/compiler-signed-zero/`                             | The TypeScript implementation of the React Compiler loses the sign of negative zero.                     |
| `react/compiler-array-spread-catch/`                      | The Rust compiler removes a catch handler around a throwing array spread (react/react#38093).            |
| `react/rust-compiler-surrogate-escape/`                   | Rust Babel-adapter compilation fails on a backslash followed by a lone surrogate.                        |
| `react/rust-compiler-unicode-diagnostic/`                 | Misplaced diagnostic underline in the Rust React Compiler.                                               |
| `typescript/lsp-shutdown-exit-code/`                      | Incorrect LSP exit code after shutdown (#64742).                                                         |
| `typescript/lsp-referenced-project-rebuild/`              | Repeated builds of an unrelated referenced project (#64862).                                             |
| `typescript/declaration-emit-missing-diagnostic-context/` | Declaration emit panics on a labeled interface (#64666).                                                 |
| `typescript/assignment-through-type-assertion/`           | A write through a type assertion incorrectly reports TS2454 (#62127).                                    |
| `docs/issues/`                                            | Issue drafts with reproduction details.                                                                  |
| `.gitignore`                                              | Excludes dependencies, caches, build output, native binaries, the copied React license, and `.DS_Store`. |
| `.vscode/settings.json`                                   | Editor settings: LF line endings, a final newline, and no trailing whitespace.                           |

## React: setup and build flow

All four React examples use Yarn Classic (`package.json` and `yarn.lock`), Node `^20.19.0 || >=22.12.0`, and Git. Run commands from the individual example's directory. A fresh clone requires `yarn install` and `yarn setup` before reproduction or Vite commands.

Each `scripts/setup.mjs` fetches a pinned React commit into `.cache/react` with `--depth=1 --filter=blob:none` and uses sparse checkout. Setup reuses caches but fetches on every run. Keep each script's source revision consistent with its README and issue draft. All four scripts declare `repository` before `commit`; preserve that order so the source can be changed deliberately when requested. A pinned reproduction should continue to demonstrate the affected revision even after an upstream fix merges.

Current source pins are:

| Example                            | Pinned React revision                      |
| :--------------------------------- | :----------------------------------------- |
| `compiler-array-spread-catch`      | `76baa3b5434fad315ece9cfd4d20d7a8d6c34a25` |
| `compiler-signed-zero`             | `9ffcb463b0ab01a42e781d4dc2e00f3a1b97a188` |
| `rust-compiler-surrogate-escape`   | `fd51cb10dd154aee73e4e7948005c02968651c3d` |
| `rust-compiler-unicode-diagnostic` | `098d2e87a1f7142947418d15f63f975b58c4685b` |

### Signed zero

From `react/compiler-signed-zero/`:

```bash
yarn install
yarn setup
yarn repro
```

`scripts/setup.mjs` checks out `compiler/packages/babel-plugin-react-compiler` and bundles its TypeScript entry point with esbuild into `.cache/compiler.cjs`. Dependencies remain external and resolve from the example's installed packages. This example does not require Rust; “TypeScript React Compiler” refers to React's compiler implementation, not the TypeScript language compiler.

`scripts/compiler.mjs` loads the built compiler and reports a missing setup step if the bundle is absent. Both `scripts/repro.mjs` and `vite.config.js` use it through Babel with `panicThreshold: 'all_errors'`.

`yarn repro` reads `src/SignedZero.jsx`, compiles it, and uses esbuild to lower JSX in both the original and compiled versions into `.cache/*.mjs`. It compares separate server renders for `true`, `false`, and `true`. These are fresh renders, not updates to one mounted component; use the browser example when checking state changes across renders. The original returns `Infinity`, `-Infinity`, and `Infinity`; the affected compiler returns `Infinity` for all three. Exit 0 means the bug reproduced; a nonzero exit means the expected bug was absent or setup or execution failed.

For the browser example, `index.html` loads `src/main.jsx`, which renders `SignedZero`. The wrapper uses `'use no memo'` and shows the expected result beside the compiled result. Run `yarn dev` and click **Toggle condition**. `yarn build` creates the Vite production build; `yarn preview` serves it. A successful build alone does not verify the bug.

### Array-spread catch handler

From `react/compiler-array-spread-catch/`, run `yarn install`, `yarn setup`, and `yarn repro`. Setup builds the experimental Rust Babel adapter and native compiler from React revision `76baa3b5434fad315ece9cfd4d20d7a8d6c34a25`, using the same build and vendor layout as the Unicode example. Rust/Cargo and native build tools are required; `CARGO` overrides the Cargo executable.

`scripts/repro.mjs` compiles `src/foo.js` with `panicThreshold: 'all_errors'`, saves original and compiled modules under `.cache/`, and executes each during a React server render so compiler memo-cache hooks have a dispatcher. The original returns `'caught'`; the affected Rust output throws a `TypeError` for the non-iterable spread. The script prints runtime errors to stderr and exits 1 when execution throws; successful execution exits 0. Compilation and setup failures also exit nonzero. This example has no Vite or browser entry point.

### Rust compiler surrogate escape

From `react/rust-compiler-surrogate-escape/`:

```bash
yarn install
yarn setup
yarn build
```

Setup builds the Rust adapter and native compiler from React revision `fd51cb10dd154aee73e4e7948005c02968651c3d`, using the same setup and vendor layout as the other Rust examples. Rust/Cargo and native build tools are required; `CARGO` overrides the Cargo executable.

The browser entry is `index.html` → `src/main.jsx` → `createRoot`. Its `App` component contains a string with UTF-16 code units `005C` and `D800` and should display its length, `2`. `vite.config.js` applies the Rust Babel adapter with `panicThreshold: 'all_errors'`; `yarn build` exits 1 with `Failed to parse AST JSON`. This is a compilation failure, before the app runs.

Use the normal Vite scripts (`dev`, `build`, and `preview`); this example has no custom `repro` script. Preserve the three backslashes before `uD800` in `src/main.jsx`; literal escape text is a different input.

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

The linked vendor package's `package.json` is tracked and points to `dist/index.js`; it is not a generated adapter. Adapter `dist/`, native binaries, and the copied license are ignored and must be produced by setup. Do not replace the tracked manifest with generated upstream package metadata.

The setup script selects the native library filename for macOS, Linux, or Windows and rejects other platforms. Platform selection in the script does not establish that reproduction has been tested on each platform.

`yarn build` runs Vite with `vite.config.js`. Source passes through Babel and the native Rust compiler; diagnostics return through the adapter to the terminal. With `panicThreshold: 'all_errors'`, the intentional props mutation fails the build. Check the underline position, and keep `"café"` and the mutation on the same line.

The browser entry is `index.html` → `src/main.jsx` → `createRoot`. `yarn dev` starts Vite; `yarn preview` serves build output.

## TypeScript: setup and data flow

All four examples use Git and the Go toolchain required by their pinned upstream revision. Check that revision's `tsc/go.mod` before selecting a Go version; the reproduction repository does not declare a shared Go version. Follow each README to fetch its pinned revision with `--depth 1` and build `./cmd/tsc` from the upstream `tsc/` module using `GOWORK=off` and `-mod=readonly`. Source and uncached dependencies require network access; binaries go into a temporary build directory. Run the commands from the example's directory and use the native binary built by those commands.

The current README source pins are:

| Example                                       | Pinned TypeScript revision                 |
| :-------------------------------------------- | :----------------------------------------- |
| `lsp-shutdown-exit-code`                      | `538671d3cc2dc1fa292dbb00185d3cdbef9aa73b` |
| `lsp-referenced-project-rebuild`              | `a91e93821feafd081641f9f5d161eba626d0b2ce` |
| `declaration-emit-missing-diagnostic-context` | `8d9b6da99ea7d4a8e7d906dd2532456dfe14e24f` |
| `assignment-through-type-assertion`           | `8d9b6da99ea7d4a8e7d906dd2532456dfe14e24f` |

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

Response waits time out after 30 seconds; after closing stdin, the script waits up to 10 seconds for shutdown. Its cleanup kills a server that is still running.

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
- For frontend build failures, prefer a minimal frontend project using its normal build command. Add a custom runner only when the reproduction needs runtime comparisons or protocol interactions that the project commands do not provide.
- Pin affected revisions and keep fixtures, commands, expected output, and issue drafts consistent.
- Follow each example's dependency and formatting conventions, and the editor settings in `.vscode/settings.json`. Avoid unrelated framework or package-manager changes.
- Keep React dependency changes in the affected example and update its Yarn lockfile when needed; there is no root dependency installation.
- Edit setup scripts or source inputs, not generated adapters or binaries. Keep generated files out of commits.
- Preserve issue links, attribution, exact errors, and the distinction between actual and expected behavior.

## README and issue writing style

- Keep each example concise, natural, and understandable in under 60 seconds. Use direct language and avoid repeating what the commands or output already show.
- Focus on reproducing the issue. Do not add fix comparisons or fix-validation instructions unless requested.
- Lead with the issue link and a brief description of the trigger and observable failure. Show a minimal, language-tagged code block before the reproduction steps when it makes the bug easier to understand; keep it identical to the relevant fixture. For project or protocol examples, use a small configuration snippet or project-reference diagram when source code alone would not explain the problem.
- Distinguish successful requests from unnecessary work or incorrect results. Explain expected behavior and material caveats without implying that a successful build or request proves the bug is absent.
- Write reproduction steps for project contributors. Omit routine prerequisite introductions such as “With Node.js, Yarn Classic, and Git installed.” Mention unusual setup requirements or version constraints only when needed to reproduce or interpret the issue.
- Omit surplus statements such as “No Vite installation is needed” or “Build artifacts stay in the temporary directory.” Include dependency or output-location details only when they affect reproduction, diagnosis, or interpretation of the result.
- Use “To reproduce:” as a short transition when there is no reproduction heading. Under a heading such as `## Steps To Reproduce`, start directly with the commands or steps; do not repeat “To reproduce:”.
- Follow the heading structure in `docs/issues/react-compiler-signed-zero.md`, `docs/issues/react-compiler-array-spread-catch.md`, `docs/issues/react-rust-compiler-surrogate-escape.md`, and `docs/issues/react-rust-compiler-unicode-diagnostic.md`: use H1 for the issue title, H2 for form fields such as `## Repro steps`, and H3 for `### Steps To Reproduce`, `### The current behavior`, and `### The expected behavior`. Use H4 for subsections such as `#### Playground` and `#### Reproduction repository` when needed.
- Keep local issue-draft heading levels as written. When preparing content for GitHub, adjust nested levels only to fit the actual destination form heading; do not impose H4/H5 on local drafts. Follow each standalone README or unrelated issue template's own structure.
- Keep tested environment details in issue reports as validation evidence, separate from setup instructions.
- Omit validation history, repeated-run summaries, and control experiments from the README unless they are needed to understand or reproduce the issue. Keep relevant evidence in the task report or issue draft.
- Explain exit codes when success means the bug reproduced or when the script's status differs from the program's status. Retain limitations that affect interpretation of the result.
- Preserve commands, identifiers, URLs, pinned revisions, exact output, and documented behavior during wording edits.

## Validation

Run the affected example and compare its output with its README. Shell success alone is insufficient: the Unicode example's Vite build fails intentionally, the array-spread script exits 1 for the runtime error, the surrogate-escape example's Vite build fails on AST JSON parsing, the signed-zero and project-rebuild scripts succeed when they detect their bugs, and the shutdown script prints the server's failure. Both standalone TypeScript compiler examples exit 2, but only the declaration-emit example should panic. In their README command blocks, the final `echo` reports the compiler's status while returning success itself.

Record the revision, OS/architecture, tool versions, commands, and results in the task report or issue draft as appropriate; a README does not need a validation section. Distinguish source-archive builds from verified clone instructions; report only tested platforms and measured behavior.

For prose-only changes, check paths, commands, Markdown, and the final diff without rebuilding upstream projects. There is no root lint or format command. Use `git diff --check` for tracked changes and inspect new files separately.
