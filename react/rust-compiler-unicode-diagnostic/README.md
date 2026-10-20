# React + Vite with the Rust React Compiler

A minimal React + Vite project using the experimental Rust React Compiler through its Babel adapter.

## Requirements

Node.js, Yarn Classic, Git, Rust/Cargo, and native build tools.

## Get started

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/rust-compiler-unicode-diagnostic
yarn install
yarn setup
yarn build
```

`yarn setup` builds the compiler and Babel adapter from [React revision `098d2e87a1`](https://github.com/react/react/tree/098d2e87a1f7142947418d15f63f975b58c4685b/compiler).

The sample in `src/main.jsx` intentionally mutates props. With `panicThreshold: 'all_errors'` enabled in `vite.config.js`, `yarn build` reports the compiler diagnostic and exits with an error.
