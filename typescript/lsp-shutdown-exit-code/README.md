# TypeScript LSP shutdown exit code

Reproduces [TypeScript #64742](https://github.com/microsoft/TypeScript/issues/64742): the language server prints `context canceled` and exits with code 1 after a normal `shutdown` followed by `exit`.

`repro.py` is the original Python script provided by [creasty](https://github.com/creasty) in the issue.

## Requirements

Python 3.8 or later, Git, and Go 1.27. No third-party Python packages are required.

## Reproduce

From this example's directory, fetch the affected revision without its history, build the compiler, and run the script:

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

The script initializes the server, waits for the `shutdown` response, then sends `exit` with stdin open. It prints the server's exit code but does not use it as its own shell exit status.

## Validation

Confirmed on macOS ARM64 at the pinned revision: the server printed `context canceled` and exited with code 1.
