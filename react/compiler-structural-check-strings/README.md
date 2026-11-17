# React Compiler: structural string checks

`$structuralCheck` from `react-compiler-runtime` silently ignores changes between ordinary strings. The [example](src/main.js) compares `"before"` with `"after"`, with numeric strings and NaN as controls.

## Get started

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-structural-check-strings
yarn install
yarn setup
yarn dev
```

`yarn setup` builds the runtime from [React revision `fd51cb10d`](https://github.com/react/react/tree/fd51cb10dd154aee73e4e7948005c02968651c3d/compiler).

Open the URL printed in the terminal. The page shows:

Actual output:

```text
ordinary strings: expected=1 actual=0 diagnostics
numeric strings : expected=1 actual=1 diagnostics
NaN values      : expected=0 actual=0 diagnostics
```

Expected output:

```text
ordinary strings: expected=1 actual=1 diagnostics
numeric strings : expected=1 actual=1 diagnostics
NaN values      : expected=0 actual=0 diagnostics
```

This example calls the runtime helper directly; it does not compile a React component. `yarn build` succeeds because the missing diagnostic occurs when the page runs.
