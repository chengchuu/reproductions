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

`yarn setup` builds the Rust compiler and Babel adapter from [React revision `a6b912fbe`](https://github.com/react/react/tree/a6b912fbe77f698ad43c922f206db0d4f4ad7485/compiler). Rust/Cargo and native build tools are required.

Output when the bug reproduces:

```text
TypeError: 1 is not iterable
```
