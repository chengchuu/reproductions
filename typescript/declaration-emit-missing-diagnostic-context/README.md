# TypeScript declaration emit missing diagnostic context

This example reproduces [TypeScript #64666](https://github.com/microsoft/TypeScript/issues/64666): declaration emit panics on a labeled interface instead of reporting a diagnostic.

## Reproduce

Run these commands from this example's directory:

```bash
build_dir="$(mktemp -d)"
git init -q "$build_dir/source"
git -C "$build_dir/source" fetch --depth 1 \
  https://github.com/microsoft/TypeScript.git \
  8d9b6da99ea7d4a8e7d906dd2532456dfe14e24f
git -C "$build_dir/source" checkout --detach FETCH_HEAD
mkdir -p "$build_dir/bin"
GOWORK=off go -C "$build_dir/source/tsc" build -mod=readonly \
  -o "$build_dir/bin/tsc" ./cmd/tsc
"$build_dir/bin/tsc" --declaration --pretty false --outDir "$build_dir/out" min.ts
echo "Exit code: $?"
```

Output starts with:

```text
panic: Diagnostic emitted without context [recovered, repanicked]
```

A stack trace follows, then `Exit code: 2`. The nonzero exit is expected, but the panic is the bug: the compiler should report the invalid label without crashing. Build artifacts and emitted files stay in the temporary directory.
