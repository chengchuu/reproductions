# React Compiler signed-zero reproduction

The TypeScript React Compiler at [React revision `9ffcb463b`](https://github.com/react/react/tree/9ffcb463b0ab01a42e781d4dc2e00f3a1b97a188) merges `0` and `-0` across branches, causing `1 / value` to return `Infinity` even when the selected value is `-0`.

To reproduce:

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-signed-zero
yarn install
yarn setup
yarn repro
```

`yarn setup` fetches the pinned source and builds the TypeScript compiler. No Rust toolchain is required.

Output when the bug reproduces:

```text
condition=true expected=Infinity actual=Infinity
condition=false expected=-Infinity actual=Infinity
condition=true expected=Infinity actual=Infinity
Bug reproduced: the compiled result loses the branch-dependent sign.
```

`yarn repro` compares server-rendered output from the original and compiled component. It exits 0 when the bug reproduces and nonzero if setup or execution fails or the expected bug is absent.

For the browser example, run `yarn dev` and open the printed URL. Click **Toggle condition**: the expected result alternates between `Infinity` and `-Infinity`, while the compiled result stays at `Infinity`.
