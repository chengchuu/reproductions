# React Compiler: hook guards with modern React

With `enableEmitHookGuards` enabled, a compiled component crashes during rendering with React 19.3.1:

```jsx
import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

## Get started

```bash
git clone https://github.com/chengchuu/reproductions.git
cd reproductions/react/compiler-hook-guards
yarn install
yarn setup
yarn dev
```

Open the URL printed in the terminal and check the browser console. The page is blank and reports:

```text
TypeError: Cannot read properties of undefined (reading 'current')
```

The page should display `Count: 0`, and clicking the button should increment the count.

`yarn setup` builds the compiler and runtime from [React revision `fd51cb10d`](https://github.com/react/react/tree/fd51cb10dd154aee73e4e7948005c02968651c3d/compiler). `vite.config.js` enables hook guards and uses this runtime.

The production build succeeds. Run `yarn build`, then `yarn preview`, and open the preview URL to reproduce the same rendering error.
