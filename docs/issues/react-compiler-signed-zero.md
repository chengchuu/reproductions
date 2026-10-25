# [Compiler Bug]: React Compiler loses the sign of negative zero

When a component selects between `0` and `-0` based on a prop, the compiled result of `1 / value` stays at `Infinity` instead of changing with the prop.

- React version: **19.3.1**
- Compiler: **TypeScript React Compiler, built from source**
- Upstream source revision: [`9ffcb463b`](https://github.com/react/react/commit/9ffcb463b0ab01a42e781d4dc2e00f3a1b97a188)

Tested on macOS x86_64 with Node.js 22.21.1 and Yarn Classic 1.22.22.

## Steps To Reproduce

Clone the example, install its dependencies, and run setup and the reproduction:

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-signed-zero
yarn install
yarn setup
yarn repro
```

`yarn setup` builds the pinned TypeScript compiler from source. `yarn repro` compares the original and compiled component using server rendering. It exits 0 when the bug reproduces, or nonzero if setup/execution fails or the expected bug is absent.

Link to code example: [React Compiler signed-zero reproduction](https://github.com/chengchuu/reproductions/tree/main/react/compiler-signed-zero)

The component in `src/SignedZero.jsx` selects the sign of zero based on `condition`:

```jsx
export function SignedZero({ condition }) {
  let value;
  if (condition) {
    value = 0;
  } else {
    value = -0;
  }
  return <output>{1 / value}</output>;
}
```

For the browser example, run `yarn dev`, open the printed URL, and click **Toggle condition**.

## The current behavior

For `condition` values `true → false → true`, the compiled component keeps returning `Infinity`:

```text
condition=true expected=Infinity actual=Infinity
condition=false expected=-Infinity actual=Infinity
condition=true expected=Infinity actual=Infinity
Bug reproduced: the compiled result loses the branch-dependent sign.
```

The browser example shows the same mismatch when the condition is false.

## The expected behavior

The compiled component should preserve the distinction between `0` and `-0`. For `true → false → true`, it should return `Infinity → -Infinity → Infinity`, matching the original component.
