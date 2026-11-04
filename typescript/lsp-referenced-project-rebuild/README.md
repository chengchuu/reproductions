# TypeScript LSP referenced project rebuild

This example reproduces [TypeScript #64862](https://github.com/microsoft/TypeScript/issues/64862): the language server rebuilds and deletes an unrelated referenced project every time an app file is opened. Language-service requests succeed, but each open repeats unnecessary project construction.

The solution lists two project references in this order:

```text
tsconfig.json
├── tsconfig.app.json   includes src/a.ts, src/b.ts, src/c.ts
└── tsconfig.node.json  includes vite.config.ts
```

Opening the app files repeatedly builds `tsconfig.node.json`, even though the earlier `tsconfig.app.json` already covers them. Later opens should reuse the matching, loaded project without rebuilding the unrelated reference. Initial project discovery may still build both projects.

## Reproduce

Run these commands from this example's directory:

```bash
build_dir="$(mktemp -d)"
git init -q "$build_dir/source"
git -C "$build_dir/source" fetch --depth 1 \
  https://github.com/microsoft/TypeScript.git \
  a91e93821feafd081641f9f5d161eba626d0b2ce
git -C "$build_dir/source" checkout --detach FETCH_HEAD
mkdir -p "$build_dir/bin"
GOWORK=off go -C "$build_dir/source/tsc" build -mod=readonly \
  -o "$build_dir/bin/tsc" ./cmd/tsc
python3 repro.py --tsc "$build_dir/bin/tsc" --log "$build_dir/server.log"
```

Output when the bug reproduces:

```text
a.ts: documentSymbol succeeded
b.ts: documentSymbol succeeded
c.ts: documentSymbol succeeded
tsconfig.node.json created: 3
tsconfig.node.json updated: 3
tsconfig.node.json deleted: 3
Issue reproduced
```

The script opens `a.ts`, `b.ts`, and `c.ts` in turn, waits for a nonempty `textDocument/documentSymbol` response, and closes each file. The three successful responses show that language-service requests work; the project counts expose the repeated construction, program update, and deletion of the unrelated reference.

Exit code 0 means the bug reproduced: at least three creations, updates, and deletions. Code 1 means the pattern was absent or the run failed. Counts depend on the debug log format; the optional `--log` argument saves the full server log.
