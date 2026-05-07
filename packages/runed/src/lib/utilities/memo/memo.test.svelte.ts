import { describe, expect } from "vitest";
import { memo } from "./memo.svelte.js";
import { testWithEffect } from "$lib/test/util.svelte.js";
import { sleep } from "$lib/internal/utils/sleep.js";

describe("memo", () => {
	testWithEffect("recomputes when a tracked source changes", async () => {
		let count = $state(2);
		const doubled = memo(
			() => count,
			(n) => n * 2
		);

		expect(doubled.current).toBe(4);

		count = 5;
		await sleep(0);
		expect(doubled.current).toBe(10);
	});

	testWithEffect("does not recompute when an untracked source changes", async () => {
		let tracked = $state(1);
		let untracked = $state(100);
		let runs = 0;

		const value = memo(
			() => tracked,
			(n) => {
				runs++;
				// reading `untracked` here must NOT register as a dependency
				return n + untracked;
			}
		);

		expect(value.current).toBe(101);
		expect(runs).toBe(1);

		untracked = 200;
		await sleep(0);
		// reading current shouldn't recompute since the dep didn't change
		expect(value.current).toBe(101);
		expect(runs).toBe(1);

		tracked = 2;
		await sleep(0);
		expect(value.current).toBe(202);
		expect(runs).toBe(2);
	});

	testWithEffect("passes the previous value to the compute fn", async () => {
		let count = $state(0);
		const seen: Array<[number, number | undefined]> = [];

		const value = memo(
			() => count,
			(curr, prev) => {
				seen.push([curr, prev]);
				return curr;
			}
		);

		// Force the first computation.
		expect(value.current).toBe(0);
		expect(seen).toEqual([[0, undefined]]);

		count = 1;
		await sleep(0);
		expect(value.current).toBe(1);
		expect(seen).toEqual([
			[0, undefined],
			[1, 0],
		]);
	});

	testWithEffect("supports an array of sources", async () => {
		let a = $state(1);
		let b = $state(2);

		const sum = memo([() => a, () => b], ([x, y]) => x + y);

		expect(sum.current).toBe(3);

		a = 10;
		await sleep(0);
		expect(sum.current).toBe(12);

		b = 20;
		await sleep(0);
		expect(sum.current).toBe(30);
	});

	testWithEffect("array sources start with an empty array as previous", () => {
		return new Promise<void>((resolve) => {
			const a = $state(1);
			const b = $state(2);

			const value = memo([() => a, () => b], ([x, y], [px, py]) => {
				expect(x).toBe(1);
				expect(y).toBe(2);
				expect(px).toBe(undefined);
				expect(py).toBe(undefined);
				resolve();
				return x + y;
			});

			// trigger the derivation
			void value.current;
		});
	});
});
