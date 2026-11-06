# [Compiler Bug]: Rust Babel adapter fails on lone surrogates after backslashes

---

## What kind of issue is this?

- [ ] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [x] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

[Rust Babel-adapter reproduction](https://github.com/chengchuu/reproductions/tree/main/react/rust-compiler-surrogate-escape)

---

## Repro steps

The experimental `babel-plugin-react-compiler-rust` adapter fails to compile a valid JavaScript string containing a literal backslash followed by a lone surrogate:

```jsx
function App() {
  'use memo';
  const text = "\\\uD800";
  return <p>{text.length}</p>;
}
```

The string contains two UTF-16 code units: `005C` (a backslash) and `D800` (a lone high surrogate). Keep the three backslashes exactly as shown. `"\\uD800"` contains literal escape text and does not trigger this bug.

### Steps To Reproduce

1. Follow the [reproduction setup instructions](https://github.com/chengchuu/reproductions/tree/main/react/rust-compiler-surrogate-escape#readme) to build the adapter from React revision `fd51cb10dd154aee73e4e7948005c02968651c3d`.
2. Run `yarn build` from the example's directory.
3. Observe the compilation failure while Rust parses the AST JSON.

The Playground does not reproduce this adapter-specific transport path.

### The current behavior

The adapter serializes Babel's AST as JSON and sanitizes lone surrogates before passing it to Rust. Its sanitizer skips a surrogate escape when another backslash immediately precedes it, without accounting for escaped backslash pairs.

For this string, the surrogate remains unsanitized and reaches Rust's JSON parser, which rejects it. The failure occurs during compilation, before any generated code executes.

The Vite production build exits with code 1. The error includes:

```text
Failed to parse AST JSON: unexpected end of hex escape at line 1 column 3364
```

Reproduced on macOS x64 with Node.js 22.21.1, Yarn Classic 1.22.22, Cargo 1.99.1, React 19.3.1, and Vite 8.3.4.

### The expected behavior

The app should build and display `2`, preserving both UTF-16 code units, `005C` and `D800`. A valid JavaScript string should not fail because of the adapter's JSON transport.

---

## How often does this bug happen?

Every time

---

## What version of React are you using?

19.3.1

---

## What version of React Compiler are you using?

Experimental `babel-plugin-react-compiler-rust`, built from react/react revision `fd51cb10dd154aee73e4e7948005c02968651c3d`.
