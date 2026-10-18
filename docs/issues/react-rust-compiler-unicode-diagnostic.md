# [rust-compiler] Diagnostic underline shifts left after non-ASCII text

Draft only: replace `<REPRO_COMMIT>` with the published reproduction commit before submitting this issue. Neither the issue nor this reproduction has been published yet.

## Description

The experimental Rust Babel adapter reports the correct props-mutation error, but its diagnostic underline starts one column too far left when `café` appears before the mutation on the same line. This is a diagnostic-formatting issue, not an incorrect rejection of valid code.

## Reproduction

[Reproduction source](https://github.com/chengchuu/reproductions/tree/<REPRO_COMMIT>/react/rust-compiler-unicode-diagnostic)

With Node.js, Yarn Classic 1.22.22, Git, Rust/Cargo, and native build tools installed:

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions
git switch --detach <REPRO_COMMIT>
cd react/rust-compiler-unicode-diagnostic
yarn install
yarn setup
yarn build
```

The setup builds the original Rust compiler from React commit `b74939d79055ec2f82364cf14089a15f5f3a95bc`. Vite runs its Babel adapter with `panicThreshold: 'all_errors'`.

```jsx
export default function App(props) {
  const text = "café"; props.value = text;
  return <h1>{props.value}</h1>;
}
```

## Actual behavior

The build fails with `This value cannot be modified`. Its underline starts on the space before `props`:

```text
> 2 |   const text = "café"; props.value = text;
    |                       ^^^^^ value cannot be modified
```

## Expected behavior

The same error should underline `props`:

```text
> 2 |   const text = "café"; props.value = text;
    |                        ^^^^^ value cannot be modified
```

## Environment

- macOS Apple Silicon
- Node.js 22.22.2; Cargo 1.99.0
- React Rust compiler: `b74939d79055ec2f82364cf14089a15f5f3a95bc`
- Vite 8.3.4; `@vitejs/plugin-react` 6.1.2; `@rolldown/plugin-babel` 0.2.4
- React and React DOM 19.3.1

The formatter mixes Babel's UTF-16 columns with UTF-8 byte offsets. The reproduction uses the unpublished Rust Babel adapter; it does not establish a bug in the published TypeScript compiler or the Oxc integration.
