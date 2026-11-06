# React + Vite with the Rust React Compiler

The experimental Rust Babel adapter fails to compile a valid string containing a backslash followed by a lone surrogate:

```jsx
function App() {
  'use memo';
  const text = "\\\uD800";
  return <p>{text.length}</p>;
}
```

## Get started

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/rust-compiler-surrogate-escape
yarn install
yarn setup
yarn build
```

`yarn setup` builds the Rust compiler and Babel adapter from [React revision `fd51cb10d`](https://github.com/react/react/tree/fd51cb10dd154aee73e4e7948005c02968651c3d/compiler). Rust/Cargo and native build tools are required.

The app should build and display `2`, but `yarn build` fails while Rust parses the AST JSON.

Output:

```text
Failed to parse AST JSON: unexpected end of hex escape at line 1 column 3364
```
