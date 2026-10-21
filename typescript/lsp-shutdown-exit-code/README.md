# TypeScript LSP shutdown exit code

Reproduces [TypeScript #64742](https://github.com/microsoft/TypeScript/issues/64742): `tsc --lsp --stdio` exits with code 1 and prints `context canceled` after a normal `shutdown` followed by `exit`.

`repro.py` is the original script from the issue, reported by [creasty](https://github.com/creasty). It initializes the server, optionally opens a document, waits for the shutdown response, and sends `exit`. It keeps stdin open so EOF cannot mask the bug.

## Requirements

Python 3.8 or later, Git, and Go 1.27 (or Go with automatic toolchain downloads enabled). No Python packages are required. Building the compiler requires network access for Git and uncached Go dependencies.

## Build both versions

Run these commands from this example's directory. They build pinned revisions in a temporary clone without changing an existing TypeScript checkout:

```bash
build_dir="$(mktemp -d)"
git clone --filter=blob:none --single-branch \
  --branch fix/lsp-shutdown-exit-code \
  https://github.com/chengchuu/TypeScript.git "$build_dir/source"
mkdir -p "$build_dir/before" "$build_dir/after"

# Parent of the fix commit.
git -C "$build_dir/source" switch --detach 41e3a52ab3^
GOWORK=off go -C "$build_dir/source/tsc" build -mod=readonly \
  -o "$build_dir/before/tsc" ./cmd/tsc

# Fix plus regression-test lint corrections.
git -C "$build_dir/source" switch --detach 842c832b87
GOWORK=off go -C "$build_dir/source/tsc" build -mod=readonly \
  -o "$build_dir/after/tsc" ./cmd/tsc
```

## Reproduce and verify

In the same terminal, from this example's directory:

```bash
# Before the fix.
PATH="$build_dir/before:$PATH" python3 repro.py
```

Expected output:

```text
context canceled
exit code: 1
```

Run the same script with the fixed binary:

```bash
PATH="$build_dir/after:$PATH" python3 repro.py
```

Expected output:

```text
exit code: 0
```

Repeat with an opened document:

```bash
doc_uri="$(python3 -c 'from pathlib import Path; print(Path("example.ts").resolve().as_uri())')"
PATH="$build_dir/before:$PATH" python3 repro.py "$doc_uri"
PATH="$build_dir/after:$PATH" python3 repro.py "$doc_uri"
```

The reported server exit codes should be 1 and 0, respectively. The script prints the server's exit code; it does not propagate that code as its own shell exit status. Each `PATH` assignment applies only to that command and selects the compiled Go language server instead of a globally installed `tsc`.

## Validation

Verified on macOS ARM64 using the original script with an empty session and an opened `example.ts`. Both cases printed `context canceled` and exit code 1 before the fix, then exit code 0 with no error after the fix.
