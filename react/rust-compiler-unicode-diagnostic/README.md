# React Rust compiler: Unicode diagnostic underline

A Vite + React app that reproduces a misplaced diagnostic underline in React's experimental Rust Babel adapter. The app intentionally mutates props. The compiler correctly rejects that mutation, but places the underline one column too far left after `café`.

## Requirements

- Node.js 20.19+ on the 20.x line, or Node.js 22.12+.
- Yarn Classic 1.22.22, Git, and a current stable Rust toolchain with Cargo on `PATH`.
- Native build tools for your platform (Xcode Command Line Tools on macOS).
- Network access for JavaScript dependencies, the pinned compiler source, and Rust crates.

## Reproduce

From the repository root:

```bash
cd react/rust-compiler-unicode-diagnostic
yarn install
yarn setup
yarn build
```

Setup fetches React commit `b74939d79055ec2f82364cf14089a15f5f3a95bc` from `chengchuu/react`, builds its Babel adapter and Rust native module, and places the generated plugin in `vendor/`. No existing React checkout is required. Source and Cargo artifacts stay in `.cache/`; generated files are ignored by Git.

`yarn build` is expected to exit with an error:

```text
Error: This value cannot be modified
```

In `src/App.jsx`, keep `café` and the mutation on the same line:

```jsx
export default function App(props) {
  const text = "café"; props.value = text;
  return <h1>{props.value}</h1>;
}
```

The underline begins on the space before `props`, rather than on `p`. Babel reports UTF-16 columns, while the original Rust formatter slices the source using UTF-8 byte offsets. `é` occupies one UTF-16 unit but two UTF-8 bytes.

To inspect the error in Vite's development overlay:

```bash
yarn dev
```

Open the local URL printed by Vite. You only need to run setup once, unless rebuilding the native module.

## Configuration and limitations

The Vite configuration applies the compiler to `src/App.jsx`. `panicThreshold: 'all_errors'` makes the compiler diagnostic fail the build instead of skipping optimization. The component returns JSX, so the default compilation mode recognizes it.

The Rust Babel plugin is unpublished and experimental; the local package contains only metadata until setup builds it. This reproduction targets the pinned Rust adapter, not the published TypeScript compiler or Vite's separate Oxc compiler integration. It includes only the buggy version.

Validated on macOS Apple Silicon with Node.js 22.22.2 and Cargo 1.99.0. Other platforms are not verified.

[Vite Babel integration](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#babel-react-compiler)
