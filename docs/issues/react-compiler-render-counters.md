# [Compiler Bug]: Render counter registration is lost after the first update

---

## What kind of issue is this?

- [x] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [ ] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

```text
https://github.com/chengchuu/reproductions/tree/main/react/compiler-render-counters
```

---

## Repro steps

````markdown
`react-compiler-runtime` loses a component's render counter registration after its first update. The example calls `useRenderCounter` directly.

This simplified example shows the trigger. The repository reproduction also displays the registry state.

```jsx
import { useState } from 'react';
import { useRenderCounter } from 'react-compiler-runtime';

export function App() {
  const [updates, setUpdates] = useState(0);
  useRenderCounter('App');

  return (
    <button onClick={() => setUpdates(updates + 1)}>Update component: {updates}</button>
  );
}
```

### Steps To Reproduce

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-render-counters
yarn install
yarn setup
yarn dev
```

Open the URL printed in the terminal and click **Update component: 0**.

### The current behavior

The number of registered counters drops from `1` to `0` while the component remains mounted:

```text
Updates: 0; registered counters: 1
Updates: 1; registered counters: 0
```

Reproduced in Chrome on macOS.

### The expected behavior

One counter should remain registered while the component is mounted.
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
react-compiler-runtime from react/react@df6aa4ec76cff5b3adde531c6fe8c36099e0469b
```
