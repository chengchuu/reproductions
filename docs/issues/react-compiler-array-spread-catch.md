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

The compiler removes a required catch handler around an array spread. The original function returns `'caught'`, but the compiled function throws a `TypeError`.

### Steps To Reproduce

#### Playground

1. Open the [React Compiler Playground reproduction](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEaEEAFAJRHAA6xRA5FGAkQLYLsSMDc9RIjhgBPGgMFEYCHLGIBtAHTKAjAF1+DAL5E4AQxxwAFuIaDpsmMUb6oAcyM4+ErfS0gANCDiE0eOyggdAwA9CE+7AAOeAA2BgSYALIQACYIyES0IHoxMVlunuBGEADuAJKYOAhWOWAoaLUIWkA).
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

The [Rust Babel-adapter reproduction](https://github.com/chengchuu/reproductions/tree/main/react/compiler-array-spread-catch) provides setup instructions for running the same example with React revision `76baa3b5434fad315ece9cfd4d20d7a8d6c34a25`.

### The current behavior

#### Playground

The generated output has no catch handler. The Playground does not execute `foo()`, so it shows no runtime exception.

#### Reproduction repository

The Rust-compiled function throws when spreading the non-iterable value `1`. With the catch handler removed, the exception escapes:

```text
TypeError: 1 is not iterable
```

### The expected behavior

The compiler should preserve the catch handler because an array spread can throw. With either backend, calling `foo()` should return `'caught'`, matching the original function.

---

## How often does this bug happen?

Every time

---

## What version of React are you using?

19.3.1

---

## What version of React Compiler are you using?

Rust compiler backends at react/react revision `76baa3b5434fad315ece9cfd4d20d7a8d6c34a25`.
