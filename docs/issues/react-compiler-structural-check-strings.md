# [Compiler Bug]: Structural checks silently ignore differences between ordinary strings

---

## What kind of issue is this?

- [x] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [ ] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

```text
https://github.com/chengchuu/reproductions/tree/main/react/compiler-structural-check-strings
```

---

## Repro steps

````markdown
`$structuralCheck` from `react-compiler-runtime` reports no difference when passed `"before"` and `"after"` as `oldValue` and `newValue`. Comparing numeric strings `"1"` and `"2"` does produce a diagnostic.

The reproduction calls the runtime helper directly and displays the number of `console.error` calls for each comparison. It does not compile a React component; impact on compiler-generated code has not been established.

### Steps To Reproduce

1. Follow the [reproduction setup instructions](https://github.com/chengchuu/reproductions/tree/main/react/compiler-structural-check-strings#get-started) to build `react-compiler-runtime` from React revision `fd51cb10dd154aee73e4e7948005c02968651c3d` and start `yarn dev`.
2. Open the URL printed in the terminal.

### The current behavior

The page shows no diagnostic for the unequal ordinary strings:

```text
ordinary strings: expected=1 actual=0 diagnostics
numeric strings : expected=1 actual=1 diagnostics
NaN values      : expected=0 actual=0 diagnostics
```

Reproduced in Chrome on macOS.

### The expected behavior

Unequal ordinary strings should produce a value-difference diagnostic, as numeric strings do. Comparing two NaN values should remain silent:

```text
ordinary strings: expected=1 actual=1 diagnostics
numeric strings : expected=1 actual=1 diagnostics
NaN values      : expected=0 actual=0 diagnostics
```
````

---

## How often does this bug happen?

Every time

---

## What version of React are you using?

```text
19.3.1
```

---

## What version of React Compiler are you using?

```text
react-compiler-runtime from react/react@fd51cb10dd154aee73e4e7948005c02968651c3d
```
