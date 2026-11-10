# [Compiler Bug]: Rust Babel adapter misaligns diagnostic underlines after non-ASCII text

---

## What kind of issue is this?

- [ ] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [x] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

```text
https://github.com/chengchuu/reproductions/tree/main/react/rust-compiler-unicode-diagnostic
```

---

## Repro steps

````markdown
This example reproduces [React #37897](https://github.com/react/react/issues/37897): [`babel-plugin-react-compiler-rust`](https://github.com/react/react/tree/main/compiler/packages/babel-plugin-react-compiler-rust) places a diagnostic underline one column too far left when `"café"` appears before a props mutation on the same line.

The adapter was introduced in the [Rust compiler port (#36173)](https://github.com/react/react/pull/36173).

- React version: **19.3.1**
- Upstream source revision: [`098d2e87a1`](https://github.com/react/react/commit/098d2e87a1f7142947418d15f63f975b58c4685b)

### Steps To Reproduce

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/rust-compiler-unicode-diagnostic
yarn install
yarn setup
yarn build
```

`yarn setup` builds the pinned Rust compiler from source. The Babel adapter uses `panicThreshold: 'all_errors'`, which makes compiler errors fail the build.

The component in `src/main.jsx` intentionally mutates props:

```jsx
function App(props) {
  const text = "café"; props.value = text;
  return <h1>{props.value}</h1>;
}
```

Keep `"café"` and `props.value` on the same line.

### The current behavior

The build correctly fails with `This value cannot be modified`, but the underline starts on the space before `props`:

```text
> 5 |   const text = "café"; props.value = text;
    |                       ^^^^^ value cannot be modified
```

Reproduced with macOS Apple Silicon, Node.js 22.22.2, Yarn 1.22.22, and Cargo 1.99.0.

### The expected behavior

The build should still fail with the props-mutation error. The underline should start at `p` in `props`:

```text
> 5 |   const text = "café"; props.value = text;
    |                        ^^^^^ value cannot be modified
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
babel-plugin-react-compiler-rust (0.0.0-experimental), built from react/react commit 098d2e87a1f7142947418d15f63f975b58c4685b
```
