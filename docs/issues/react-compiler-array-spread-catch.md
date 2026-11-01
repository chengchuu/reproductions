# [Compiler Bug]: Array spreads lose required catch handlers

---

## What kind of issue is this?

- [x] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [ ] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEaEEAFAJRHAA6xRA5FGAkQLYLsSMDc9RIjhgBPGgMFEYCHLGIBtAHTKAjAF1+DAL5E4AQxxwAFuIaDpsmMUb6oAcyM4+ErfS0gANCDiE0eOyggdAwA9CE+7AAOeAA2BgSYALIQACYIyES0IHoxMVlunuBGEADuAJKYOAhWOWAoaLUIWkA

---

## Repro steps

The compiler removes a required catch handler around an array spread. The original function returns `'caught'`, but the compiled function throws a `TypeError` when executed.

### Steps To Reproduce

#### Playground

1. Open the [React Compiler Playground](https://playground.react.dev/).
2. Compile this function:

```js
function foo() {
  'use memo';
  try {
    return [...1];
  } catch {
    return 'caught';
  }
}
```

3. Inspect the generated output: `[...1]` remains, but its `try/catch` is removed.

#### Reproduction repository

Pending: add the pinned Rust Babel-adapter reproduction link and commands. A standalone Rust reproduction has not been added to this repository yet.

Recorded fixture runtime evaluation reproduced the bug in both the TypeScript and Rust backends against React revision `a6b912fbe77f698ad43c922f206db0d4f4ad7485`.

### The current behavior

The Playground output removes the catch handler. The output pane shows generated code; it does not execute `foo()`, so no runtime exception appears there.

Executing the compiled function attempts to spread the non-iterable value `1`. The exception escapes instead of reaching the original catch handler:

```text
TypeError: 1 is not iterable
```

### The expected behavior

The compiler should preserve the catch handler because an array spread can throw. Calling `foo()` should return `'caught'` in both backends, matching the original function.

---

## How often does this bug happen?

Every time in the recorded fixture runtime evaluation.

---

## What version of React are you using?

Not recorded for this reproduction.

---

## What version of React Compiler are you using?

The TypeScript and Rust compiler backends at react/react revision `a6b912fbe77f698ad43c922f206db0d4f4ad7485`. The deployed Playground compiler revision has not been recorded.
