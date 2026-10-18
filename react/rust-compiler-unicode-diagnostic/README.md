# React + Vite with the Rust React Compiler

A minimal React + Vite project using the experimental Rust React Compiler through its Babel adapter. Vite provides the development server and production build, and a setup script builds the compiler from official React source.

## Requirements

Node.js, Yarn Classic, Git, Rust/Cargo, and native build tools.

## Get started

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/rust-compiler-unicode-diagnostic
yarn install
yarn setup
yarn dev
```

Open the local URL printed by Vite.

The current sample in `src/main.jsx` mutates props, so it triggers a compiler error during development and prevents a successful production build.

## Available scripts

- `yarn setup`: Download the pinned React source and build the Rust compiler and Babel adapter.
- `yarn dev`: Start the Vite development server.
- `yarn build`: Create a production build in `dist/`.
- `yarn preview`: Serve a successful production build locally.

## Compiler configuration

`yarn setup` builds the experimental Rust Babel adapter from the [official React repository at `098d2e87a1`](https://github.com/react/react/tree/098d2e87a1f7142947418d15f63f975b58c4685b/compiler). This is a pinned upstream source revision, not a numbered compiler release.

The script downloads source into `.cache/` and builds the local plugin in `vendor/`. No existing React checkout is required. Run setup after installing dependencies and whenever you need to rebuild the native module.

`vite.config.js` enables the Rust Babel adapter with `panicThreshold: 'all_errors'`, so compiler errors appear during development and fail the build.
