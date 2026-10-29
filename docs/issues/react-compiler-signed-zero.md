# [Compiler Bug]: React Compiler loses the sign of negative zero

---

## What kind of issue is this?

- [x] React Compiler core (the JS output is incorrect, or your app works incorrectly after optimization)
- [ ] babel-plugin-react-compiler (build issue installing or using the Babel plugin)
- [ ] eslint-plugin-react-hooks (build issue installing or using the eslint plugin)
- [ ] react-compiler-healthcheck (build issue installing or using the healthcheck script)

---

## Link to repro

https://playground.react.dev/#N4Igzg9grgTgxgUxALhAgHgBwjALgAgDMoA7OXASwhPwGUKBzEhAEwC0EYIAKYfOaiwqVq+AL4BKfMAA6NfABsEBAG4BDBVAQBuOfnwVC+bgJJCRJKbPn71mhPgC8+AAy75Y-AgVgH1-bYaWk74ALRueuKRMMqwNAA80LiYULgAfMAAjPgA9Ph2WmLxOUkp6e5iIAA0IKaEjCgg-rk5AgC2mBQKahYAshAsCMj4MiAaCqNylTVgABYQAO4AkiS4nCQaYCiEmwhiQA

---

## Repro steps

When a prop selects between `0` and `-0`, the compiled component returns `Infinity` for `1 / value` in both branches. The negative-zero branch should return `-Infinity`.

#### Steps To Reproduce

##### Playground

1. Open the [React Compiler Playground reproduction - playground.react.dev](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAgHgBwjALgAgDMoA7OXASwhPwGUKBzEhAEwC0EYIAKYfOaiwqVq+AL4BKfMAA6NfABsEBAG4BDBVAQBuOfnwVC+bgJJCRJKbPn71mhPgC8+AAy75Y-AgVgH1-bYaWk74ALRueuKRMMqwNAA80LiYULgAfMAAjPgA9Ph2WmLxOUkp6e5iIAA0IKaEjCgg-rk5AgC2mBQKahYAshAsCMj4MiAaCqNylTVgABYQAO4AkiS4nCQaYCiEmwhiQA).
2. Inspect the compiled output for this component:

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

##### Reproduction repository

The [repository reproduction](https://github.com/chengchuu/reproductions/tree/main/react/compiler-signed-zero) includes setup instructions and a runtime comparison using React **19.3.1** and the TypeScript compiler built from commit [`9ffcb463b`](https://github.com/react/react/commit/9ffcb463b0ab01a42e781d4dc2e00f3a1b97a188). It was tested on macOS arm64 with Node.js 22.22.2 and Yarn Classic 1.22.22.

#### The current behavior

##### Playground

The compiler folds `1 / value` to `Infinity`, regardless of `condition`:

```jsx
t1 = <output>{Infinity}</output>;
```

##### Reproduction repository

The runtime comparison reports:

```text
condition=true expected=Infinity actual=Infinity
condition=false expected=-Infinity actual=Infinity
condition=true expected=Infinity actual=Infinity
Bug reproduced: the compiled result loses the branch-dependent sign.
```

#### The expected behavior

The compiled component should distinguish `0` from `-0`. For `true → false → true`, it should return `Infinity → -Infinity → Infinity`, matching the original component.

---

## How often does this bug happen?

Every time

---

## What version of React are you using?

19.3.1

---

## What version of React Compiler are you using?

React Compiler, built from react/react commit 9ffcb463b0ab01a42e781d4dc2e00f3a1b97a188
