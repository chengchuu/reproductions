# React Compiler array-spread catch reproduction

The experimental Rust Babel adapter removes the catch handler around `[...1]`. Instead of returning `'caught'`, the compiled function throws a `TypeError`.

To reproduce:

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-array-spread-catch
yarn install
yarn setup
yarn repro
```

`yarn setup` builds the Rust compiler and Babel adapter from [React revision `76baa3b54`](https://github.com/react/react/tree/76baa3b5434fad315ece9cfd4d20d7a8d6c34a25/compiler). Rust/Cargo and native build tools are required.

Output when the bug reproduces:

```text
TypeError: 1 is not iterable
```

When the bug is fixed, `yarn repro` prints nothing and exits with code 0.
