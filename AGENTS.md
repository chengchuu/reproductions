# Contributor guide

## Repository purpose

Each example independently reproduces an upstream bug, with its own fixtures, dependencies, and instructions. There is no root package manifest, shared startup, or repository-wide test runner.

Read the example's `README.md` first. Preserve the bug trigger: a failed build or nonzero server exit may be the expected result.

## Repository map

| Path | Role |
| --- | --- |
| `README.md` | Example index and links to issue drafts. |
| `react/rust-compiler-unicode-diagnostic/` | Misplaced diagnostic underline in the Rust React Compiler. |
| `typescript/lsp-shutdown-exit-code/` | Incorrect LSP exit code after shutdown (#64742). |
| `typescript/lsp-referenced-project-rebuild/` | Repeated builds of an unrelated referenced project (#64862). |
| `docs/issues/` | Issue drafts with reproduction details. |
| `.gitignore` | Excludes dependencies, caches, build output, native binaries, and the copied React license. |

## React: setup and build flow

From `react/rust-compiler-unicode-diagnostic/`:

```bash
yarn install
yarn setup
yarn build
```

Use Yarn Classic (`package.json` and `yarn.lock`), Node `^20.19.0 || >=22.12.0`, Git, Rust/Cargo, and native build tools.

`yarn setup` runs `scripts/setup.mjs`, which:

1. Fetches the pinned React commit into `.cache/react` with `--depth=1 --filter=blob:none`, uses sparse checkout for `compiler/` and root files, and links the example's Node dependencies.
2. Compiles the Babel adapter with TypeScript and builds `react_compiler_napi` with Cargo's `--locked` flag into `.cache/target`.
3. Copies the adapter output, native library (`native/index.node`), and upstream license into `vendor/babel-plugin-react-compiler-rust/`.

A fresh clone requires both install and setup before building. Setup reuses its caches but fetches on every run. Set `CARGO` to override the Cargo executable. Keep the source revision in `scripts/setup.mjs` consistent with the README and issue draft.

`yarn build` runs Vite with `vite.config.js`. Source passes through Babel and the native Rust compiler; diagnostics return through the adapter to the terminal. With `panicThreshold: 'all_errors'`, the intentional props mutation fails the build. Check the underline position, and keep `"café"` and the mutation on the same line.

The browser entry is `index.html` → `src/main.jsx` → `createRoot`. `yarn dev` starts Vite; `yarn preview` serves build output.

## TypeScript: setup and data flow

Both examples require Python 3.8 or later, Git, and Go 1.27. Follow their READMEs to fetch a pinned revision with `--depth 1` and build `./cmd/tsc` from the upstream `tsc/` module using `GOWORK=off`. Source and uncached dependencies require network access; binaries go into a temporary build directory.

The Python clients use only the standard library. They launch `tsc --lsp --stdio`, exchange JSON-RPC messages with `Content-Length` headers, and answer server requests while waiting for responses.

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

## Making changes

- Check `git status` and preserve unrelated work, including untracked examples.
- Add examples under the upstream project's directory and link them from the root README.
- Pin affected revisions and keep fixtures, commands, expected output, and issue drafts consistent.
- Follow each example's dependency and formatting conventions. Avoid unrelated framework or package-manager changes.
- Edit setup scripts or source inputs, not generated adapters or binaries. Keep generated files out of commits.
- Preserve issue links, attribution, exact errors, and the distinction between actual and expected behavior.

## Validation

Run the affected example and compare its output with its README. Shell success alone is insufficient: the React build fails intentionally, the shutdown script prints the server's failure, and the rebuild script succeeds when it detects the bug.

Record the revision, OS/architecture, tool versions, commands, and results. Distinguish source-archive builds from verified clone instructions; report only tested platforms and measured behavior.

For prose-only changes, check paths, commands, Markdown, and the final diff without rebuilding upstream projects. There is no root lint or format command. Use `git diff --check` for tracked changes and inspect new files separately.
