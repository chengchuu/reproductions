# Understanding $structuralCheck in React Compiler

`$structuralCheck` is a diagnostic helper exported by `react-compiler-runtime`. It compares two values and reports differences through `console.error`. It does not return an equality result, update state, or repair either value.

This article describes the [runtime implementation at React revision `fd51cb10d`](https://github.com/react/react/blob/fd51cb10dd154aee73e4e7948005c02968651c3d/compiler/packages/react-compiler-runtime/src/index.ts) and a local fix for its string comparisons. The reproduction calls the helper directly; an active compiler-generated call path has not been established in this investigation. Its export alone does not establish a stable application API contract.

## Parameters and diagnostic output

The helper accepts two values followed by four diagnostic labels:

```ts
$structuralCheck(
  oldValue: any,
  newValue: any,
  variableName: string,
  fnName: string,
  kind: string,
  loc: string,
): void
```

| Parameter      | Meaning                               |
|:---------------|:--------------------------------------|
| `oldValue`     | First value to compare                |
| `newValue`     | Second value to compare               |
| `variableName` | Variable label in the diagnostic      |
| `fnName`       | Function label in the diagnostic      |
| `kind`         | Caller-supplied category label        |
| `loc`          | Caller-supplied source-location label |

The caller supplies both values. Despite the names `oldValue` and `newValue`, the helper does not track previous renders or retain a previous value. The `any` types permit different inputs but do not guarantee complete handling of every JavaScript value.

For example, this call compares two numeric strings:

```js
$structuralCheck('1', '2', 'value', 'Component', 'test', '1:1');
```

On its first occurrence, it logs:

```text
Component:1:1 [test] value changed from 1 to 2 at depth 0
```

The labels provide context; they do not change the comparison rules.

## What it compares

The helper first skips values that satisfy `oldValue === newValue`. It then checks types and handles several structures separately:

| Value kind       | Comparison behavior                                                   |
|:-----------------|:----------------------------------------------------------------------|
| Different types  | Reports a type difference                                             |
| Null             | Distinguishes null from other objects                                 |
| Arrays           | Checks array versus object, length, and corresponding elements        |
| Maps             | Checks instance type, size, key presence, and corresponding values    |
| Sets             | Checks instance type, size, and membership                            |
| React elements   | Checks element versus object, element type, and props                 |
| Other objects    | Checks enumerable string properties with `for...in`                   |
| Functions        | Skips differences between functions                                   |
| NaN              | Intends to ignore two NaN values and report NaN versus another number |
| Other primitives | Reports unequal values after the preceding checks                     |

Map keys and Set members use their collections' native lookup semantics; they are not recursively compared as structures. Ordinary-object traversal includes inherited enumerable properties and does not inspect symbol keys.

Nested comparisons add a path to the diagnostic. For example, unequal numeric strings under a `text` property produce a path such as `value.text`; array elements produce paths such as `value[0]`.

## Limits and side effects

- **Depth is limited to 2.** The root comparison has depth 0. Comparisons beyond depth 2 are skipped, including deeper differences in nested objects, arrays, Map values, and React props.
- **Identical messages are deduplicated.** A module-level `seenErrors` set suppresses a diagnostic after that exact message has been logged once. Repeating a call can therefore produce no additional output.
- **Identical references are skipped.** Passing the same object twice cannot reveal an earlier mutation; the helper has no snapshot of its previous contents.
- **Some differences are intentionally ignored.** Distinct functions are skipped, and strict equality treats `0` and `-0` as equal. React element handling does not separately compare keys or refs.
- **Object handling is selective.** It does not provide complete prototype, property-descriptor, or built-in-object comparison. For example, different Dates can have no enumerable properties to compare.
- **Reading and formatting can execute code or throw.** Property access can invoke getters, while collection lookups and diagnostic interpolation are not protected by a catch block.

These rules make it a bounded diagnostic checker, not a general deep-equality function. Its `void` return type also means callers cannot use its return value to decide whether two values match.

## Why ordinary string differences disappear

The affected revision uses global `isNaN()` in its NaN branch. That function coerces its argument to a number:

```js
isNaN('before'); // true
isNaN('after');  // true
```

Both strings enter the NaN branch. Because both checks return true, the helper logs nothing and never reaches its final unequal-value check. A numeric string compared with a nonnumeric string can instead receive a misleading NaN-mismatch diagnostic.

The local fix uses non-coercing `Number.isNaN()`:

```js
Number.isNaN('before'); // false
Number.isNaN('after');  // false
Number.isNaN(NaN);      // true
```

Ordinary strings then reach the value-difference check, while actual NaN values retain their intended treatment. With that fix, a first comparison of `"before"` and `"after"` using the labels above reports:

```text
Component:1:1 [test] value changed from before to after at depth 0
```

The affected runtime does not produce this message. The local regression tests assert the fixed behavior; this article does not claim that the fix has been merged or published.

## Reproduce the missing diagnostic

Follow the [structural string checks example](../react/compiler-structural-check-strings/README.md#get-started). It builds the affected runtime from the pinned revision and starts a minimal page with `yarn dev`.

The page captures `console.error` calls and displays their counts:

```text
ordinary strings: expected=1 actual=0 diagnostics
numeric strings : expected=1 actual=1 diagnostics
NaN values      : expected=0 actual=0 diagnostics
```

The numeric-string control confirms that the checker reports differences; the NaN control confirms that comparing two NaN values remains silent. The ordinary-string result exposes the bug.

This behavior was reproduced in Chrome on macOS. It is a missing runtime diagnostic, not a compilation failure. The example does not establish that ordinary compiled applications invoke this helper or experience incorrect rendering.
