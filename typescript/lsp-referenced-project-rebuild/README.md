# TypeScript LSP referenced project rebuild

This example reproduces [TypeScript #64862](https://github.com/microsoft/TypeScript/issues/64862): opening app files repeatedly builds and deletes an unrelated referenced project.

The solution config references `tsconfig.app.json`, which includes `src`, and `tsconfig.node.json`, which includes only `vite.config.ts`. No Vite installation is needed.

## Requirements

You need Python 3.8 or later, Git, and Go 1.27. The script uses only the Python standard library.

## Reproduce

Run these commands from this example's directory to build an affected revision:

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

The script opens each app file, waits for a successful `textDocument/documentSymbol` response, and closes the file. Debug logs show that the server creates, builds, and deletes `tsconfig.node.json` on every open, although that project contains none of the app files. Expected behavior is to avoid repeatedly building this unrelated project.

The script exits with code 0 when it observes at least three creations, updates, and deletions. It exits with code 1 if that pattern is absent or the run fails. These counts depend on the server's debug log format. The optional `--log` argument saves the full server log for inspection.

## Validation

Reproduced on macOS ARM64 with Go 1.27.0 using a clean source archive of the pinned upstream revision. The shallow-fetch commands above were not run during validation. Three additional runs using `dev/experiments` revision `c2dc7160e56ae1e03da9a0b520879ef571601d64` each reported three creations, updates, and deletions. That revision differs from the pinned upstream revision only in `AGENTS.md`.

A single-config control using `{"include": ["src"]}` returned document symbols for all three files and reported zero creations, updates, and deletions of `tsconfig.node.json`. This fixture confirms repeated project builds; it does not reproduce the original report's large-project timing measurements.
