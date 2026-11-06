# [Compiler Bug]: Array spreads lose required catch handlers

---

## What kind of issue is this?

- [x] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [ ] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

```text
https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEaEEAFAJRHAA6xRA5FGAkQLYLsSMDc9RIjhgBPGgMFEYCHLGIBtAHTKAjAF1eRAPRaiAFQAWMCAHcw+kQAcEAURjGYyIiqJ5zmCDlc4EMAIYARgA2CBIAvkRwfjhwBuIMgtKyMMSMUVAA5gY4fNq6NgAe1rgIACZSCGBQQTjh9GEgADQgcIRoeBkoIHQMOq3slnhB0QSYALIQpQhOtCB+QUGz9U3gBqYAkpg+KfNgKGi7CGFAA
```

---

## Repro steps

````markdown
The compiler removes a required catch handler around an array spread. The original function returns `'caught'`, but the compiled function will throw `TypeError: 1 is not iterable` from `[...1]`.

### Steps To Reproduce

#### Playground

1. Open the [React Compiler Playground reproduction](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEaEEAFAJRHAA6xRA5FGAkQLYLsSMDc9RIjhgBPGgMFEYCHLGIBtAHTKAjAF1eRAPRaiAFQAWMCAHcw+kQAcEAURjGYyIiqJ5zmCDlc4EMAIYARgA2CBIAvkRwfjhwBuIMgtKyMMSMUVAA5gY4fNq6NgAe1rgIACZSCGBQQTjh9GEgADQgcIRoeBkoIHQMOq3slnhB0QSYALIQpQhOtCB+QUGz9U3gBqYAkpg+KfNgKGi7CGFAA). It loads this function:

```js
function foo() {
  'use memo';
  try {
    return [...1]; // Throws TypeError: 1 is not iterable
  } catch {
    return 'caught'; // Expected result
  }
}
```

2. Inspect the generated output: `[...1]` remains, but its `try/catch` is removed.

```js
import { c as _c } from "react/compiler-runtime";
function foo() {
  "use memo";
  const $ = _c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = [...1]; // Still throws, but no try/catch remains
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
```

#### Reproduction repository

The [Rust Babel-adapter reproduction](https://github.com/chengchuu/reproductions/tree/main/react/compiler-array-spread-catch) includes setup instructions for React revision `76baa3b5434fad315ece9cfd4d20d7a8d6c34a25`.

### The current behavior

The compiled `foo()` throws `TypeError: 1 is not iterable` instead of returning `'caught'`.

#### Playground

The generated output has no catch handler. The Playground does not execute `foo()`, so it shows no runtime exception.

#### Reproduction repository

```text
TypeError: 1 is not iterable
```

### The expected behavior

With either backend, calling `foo()` should return `'caught'`, as the original function does.
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
TypeScript (Playground) and Rust at revision `76baa3b5434fad315ece9cfd4d20d7a8d6c34a25`.
```
