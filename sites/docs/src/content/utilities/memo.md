---
title: memo
description: Compute a derived value from explicit dependencies
category: Reactivity
---

Runes provide a handy way of computing a value from reactive sources:
[`$derived`](https://svelte.dev/docs/svelte/$derived). It automatically detects which inner
values are read, and re-computes when they change.

`$derived` is great, but sometimes you want to manually specify which values should trigger
recomputation. Svelte provides an `untrack` function, allowing you to specify that a dependency
_shouldn't_ be tracked, but it doesn't provide a way to say that _only certain values_ should be
tracked.

`memo` does exactly that. It accepts a getter function that returns the dependencies, and a
compute function that produces the value. Only the dependencies are tracked.

## Usage

### memo

Computes a value whenever one of the sources changes. The result is exposed through `current`.

<!-- prettier-ignore -->
```ts
import { memo } from "runed";

let count = $state(2);
const doubled = memo(() => count, (n) => n * 2);

doubled.current; // 4
```

You can also send in an array of sources.

<!-- prettier-ignore -->
```ts
let a = $state(1);
let b = $state(2);
const sum = memo([() => a, () => b], ([a, b]) => a + b);
```

The compute function receives two arguments: the current value of the sources, and the previous
value.

<!-- prettier-ignore -->
```ts
let count = $state(0);
const message = memo(() => count, (curr, prev) => {
	return `count is ${curr}, was ${prev}`;
});
```

Reads inside the compute function are not tracked, so you can freely access other reactive state
without it triggering a recomputation.
