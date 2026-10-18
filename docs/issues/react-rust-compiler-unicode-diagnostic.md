# Bug: [rust-compiler] Diagnostic underline shifts left after non-ASCII text

The experimental Rust React Compiler reports the correct props-mutation error, but places its diagnostic underline one column too far left when `"café"` appears before the mutation on the same line.

React version: **19.3.1**
Compiler: **experimental Rust React Compiler**
Upstream source revision: [`098d2e87a1`](https://github.com/react/react/commit/098d2e87a1f7142947418d15f63f975b58c4685b).
Tested on macOS Apple Silicon with Node.js 22.22.2, Yarn 1.22.22, and Cargo 1.99.0.

## Steps To Reproduce

1. Install Node.js, Yarn Classic, Git, Rust/Cargo, and native build tools.
2. Clone the reproduction and run its Vite build:

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/rust-compiler-unicode-diagnostic
yarn install
yarn setup
yarn build
```

`yarn setup` builds the pinned Rust compiler from source. The Vite configuration uses its Babel adapter with `panicThreshold: 'all_errors'`.

Link to code example: [React Rust compiler Unicode diagnostic reproduction](https://github.com/chengchuu/reproductions/tree/main/react/rust-compiler-unicode-diagnostic)

The component intentionally mutates props:

```jsx
export default function App(props) {
  const text = "café"; props.value = text;
  return <h1>{props.value}</h1>;
}
```

Keep `"café"` and `props.value` on the same line.

## The current behavior

The build correctly fails with `This value cannot be modified`, but the underline starts on the space before `props`:

```text
> 2 |   const text = "café"; props.value = text;
    |                       ^^^^^ value cannot be modified
```

## The expected behavior

The same diagnostic should underline `props`, starting at `p`:

```text
> 2 |   const text = "café"; props.value = text;
    |                        ^^^^^ value cannot be modified
```

The props-mutation error is expected; its underline should point to the correct location.
