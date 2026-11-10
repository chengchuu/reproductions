# [Compiler Bug]: Hook guards crash during rendering with React 19

---

## What kind of issue is this?

- [x] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [ ] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

```text
https://github.com/chengchuu/reproductions/tree/main/react/compiler-hook-guards
```

---

## Repro steps

````markdown
With `environment.enableEmitHookGuards` enabled, this compiled component crashes during rendering with React 19.3.1:

```jsx
import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### Steps To Reproduce

1. Follow the [reproduction setup instructions](https://github.com/chengchuu/reproductions/tree/main/react/compiler-hook-guards#readme) to build the compiler and `react-compiler-runtime` from React revision `fd51cb10dd154aee73e4e7948005c02968651c3d`.
2. Run `yarn dev` from the example's directory and open the URL printed in the terminal.

The example enables `enableEmitHookGuards` with `$dispatcherGuard` from the pinned runtime.

### The current behavior

The page is blank, and the browser console reports:

```text
TypeError: Cannot read properties of undefined (reading 'current')
```

`yarn build` succeeds, but `yarn preview` reproduces the same error when the page renders. Reproduced in development and production in Chrome on macOS.

### The expected behavior

The page should display `Count: 0`, and clicking the button should increment the count without throwing.
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
babel-plugin-react-compiler and react-compiler-runtime, built from react/react revision fd51cb10dd154aee73e4e7948005c02968651c3d
```
