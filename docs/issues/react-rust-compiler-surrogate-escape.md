# [Compiler Bug]: Rust Babel adapter fails to compile lone surrogates after backslashes

---

## What kind of issue is this?

- [ ] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [x] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

```text
https://github.com/chengchuu/reproductions/tree/main/react/rust-compiler-surrogate-escape
```

---

## Repro steps

````markdown
`babel-plugin-react-compiler-rust` fails to compile a valid JavaScript string containing a literal backslash followed by a lone surrogate:

```jsx
function App() {
  'use memo';
  const text = "\\\uD800";
  return <p>{text.length}</p>;
}
```

The string contains two UTF-16 code units: `005C` (a backslash) and `D800` (a lone high surrogate). Keep all three backslashes as shown. `"\\uD800"` contains literal escape text and does not trigger this bug.

### Steps To Reproduce

1. Follow the [reproduction setup instructions](https://github.com/chengchuu/reproductions/tree/main/react/rust-compiler-surrogate-escape#readme) to build the adapter from React revision `fd51cb10dd154aee73e4e7948005c02968651c3d`.
2. Run `yarn build` from the example's directory.

### The current behavior

Compilation fails during `yarn build`, which exits with code 1 and reports:

```text
Failed to parse AST JSON: unexpected end of hex escape at line 1 column 3364
```

Reproduced on macOS with Node.js 22.21.1, Yarn Classic 1.22.22, Cargo 1.99.1.

### The expected behavior

The app should build and display 2, preserving the original string.
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
`babel-plugin-react-compiler-rust`, built from react/react revision `fd51cb10dd154aee73e4e7948005c02968651c3d`.
```
