# TypeScript LSP shutdown exit code

This example reproduces [TypeScript #64742](https://github.com/microsoft/TypeScript/issues/64742): the language server prints `context canceled` and exits with code 1 after a normal `shutdown` followed by `exit`.

`repro.py` comes from [creasty](https://github.com/creasty)’s original issue report.

## Reproduce

Run these commands from this example's directory to fetch a single affected revision, build the compiler, and reproduce the bug:

```bash
build_dir="$(mktemp -d)"
git init -q "$build_dir/source"
git -C "$build_dir/source" fetch --depth 1 \
  https://github.com/microsoft/TypeScript.git \
  538671d3cc2dc1fa292dbb00185d3cdbef9aa73b
git -C "$build_dir/source" checkout --detach FETCH_HEAD
mkdir -p "$build_dir/bin"
GOWORK=off go -C "$build_dir/source/tsc" build -mod=readonly \
  -o "$build_dir/bin/tsc" ./cmd/tsc
PATH="$build_dir/bin:$PATH" python3 repro.py
```

Expected output:

```text
context canceled
exit code: 1
```

The script initializes the server, waits for the `shutdown` response, then sends `exit` while keeping stdin open. The printed exit code belongs to the server; the Python script itself still exits successfully.

## Validation

Tested on macOS ARM64 with the revision used in these commands. The server printed `context canceled` and exited with code 1.
