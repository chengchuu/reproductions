# React Compiler signed-zero reproduction

The TypeScript React Compiler at [React revision `9ffcb463b`](https://github.com/react/react/tree/9ffcb463b0ab01a42e781d4dc2e00f3a1b97a188) merges `0` and `-0` across branches, changing the result of `1 / value`.

With Node.js `^20.19.0 || >=22.12.0`, Yarn Classic, and Git installed:

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-signed-zero
yarn install
yarn setup
yarn repro
```

`yarn setup` fetches the pinned source and builds the TypeScript compiler. No Rust toolchain is required.

Expected terminal output:

```text
condition=true expected=Infinity actual=Infinity
condition=false expected=-Infinity actual=Infinity
condition=true expected=Infinity actual=Infinity
Bug reproduced: the compiled result loses the branch-dependent sign.
```

`yarn repro` compares the original and compiled component using server rendering. It exits 0 when this bug reproduces, or nonzero if setup/execution fails or the expected bug is absent.

For the browser example, run `yarn dev` and open the printed URL. Click **Toggle condition**: the expected result alternates between `Infinity` and `-Infinity`, while the compiled result stays at `Infinity`.
