# TypeScript LSP referenced project rebuild

This example reproduces [TypeScript #64862](https://github.com/microsoft/TypeScript/issues/64862): opening app files repeatedly builds and deletes an unrelated referenced project.

The solution references `tsconfig.app.json` for `src` and `tsconfig.node.json` for `vite.config.ts`. No Vite installation is needed.

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

Expected output when the bug reproduces:

```text
a.ts: documentSymbol succeeded
b.ts: documentSymbol succeeded
c.ts: documentSymbol succeeded
tsconfig.node.json created: 3
tsconfig.node.json updated: 3
tsconfig.node.json deleted: 3
Issue reproduced
```

The script opens each app file, waits for a successful `textDocument/documentSymbol` response, and closes it. The bug causes `tsconfig.node.json` to be rebuilt on every open, even though it contains none of these files.

Exit code 0 means the bug reproduced: at least three creations, updates, and deletions. Code 1 means the pattern was absent or the run failed. Counts depend on the debug log format; the optional `--log` argument saves the full server log.
