# TypeScript assignment through a type assertion

This example reproduces [TypeScript #62127](https://github.com/microsoft/TypeScript/issues/62127): an assignment through a type assertion incorrectly reports that the variable is used before being assigned.

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
"$build_dir/bin/tsc" --strict --noEmit --pretty false min.ts
echo "Exit code: $?"
```

Reproduction output:

```text
min.ts(3,4): error TS2454: Variable 'value' is used before being assigned.
Exit code: 2
```

The diagnostic is the bug: the assignment writes to `value` without reading it. The compiler should accept this code. Build artifacts stay in the temporary directory.
