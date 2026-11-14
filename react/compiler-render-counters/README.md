# React Compiler: render counter registration

`react-compiler-runtime` loses a component's render counter registration after its first update, even though the component is still mounted.

## Get started

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-render-counters
yarn install
yarn setup
yarn dev
```

Open the URL printed in the terminal and click **Update component: 0**. The page shows:

```text
Updates: 0; registered counters: 1
Updates: 1; registered counters: 0
```

Expected: one counter remains registered after updates.

`yarn setup` builds the runtime from [React revision `df6aa4ec7`](https://github.com/react/react/tree/df6aa4ec76cff5b3adde531c6fe8c36099e0469b/compiler/packages/react-compiler-runtime). The example uses React 19.3.1 and calls `useRenderCounter` directly.
