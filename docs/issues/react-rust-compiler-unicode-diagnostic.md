# [Compiler Bug]: Rust Babel adapter misaligns diagnostic underlines after non-ASCII text

This example reproduces [React #37897](https://github.com/react/react/issues/37897): the experimental [`babel-plugin-react-compiler-rust`](https://github.com/react/react/tree/main/compiler/packages/babel-plugin-react-compiler-rust) adapter places a diagnostic underline one column too far left when `"café"` appears before a props mutation on the same line.

The React team introduced this adapter as part of the [experimental Rust compiler port (#36173)](https://github.com/react/react/pull/36173).

- React version: **19.3.1**
- Compiler: **experimental Rust React Compiler**
- Upstream source revision: [`098d2e87a1`](https://github.com/react/react/commit/098d2e87a1f7142947418d15f63f975b58c4685b)

Tested on macOS Apple Silicon with Node.js 22.22.2, Yarn 1.22.22, and Cargo 1.99.0.

## Steps To Reproduce

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/rust-compiler-unicode-diagnostic
yarn install
yarn setup
yarn build
```

`yarn setup` builds the pinned Rust compiler from source. The Babel adapter uses `panicThreshold: 'all_errors'`, which makes compiler errors fail the Vite build.

Code example: [React Rust compiler Unicode diagnostic reproduction](https://github.com/chengchuu/reproductions/tree/main/react/rust-compiler-unicode-diagnostic)

The component in `src/main.jsx` intentionally mutates props:

```jsx
function App(props) {
  const text = "café"; props.value = text;
  return <h1>{props.value}</h1>;
}
```

Keep `"café"` and `props.value` on the same line.

## The current behavior

The build correctly fails with `This value cannot be modified`, but the underline starts on the space before `props`:

```text
> 5 |   const text = "café"; props.value = text;
    |                       ^^^^^ value cannot be modified
```

## The expected behavior

The build should still fail with the props-mutation error. The underline should start at `p` in `props`:

```text
> 5 |   const text = "café"; props.value = text;
    |                        ^^^^^ value cannot be modified
```
