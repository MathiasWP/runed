import { untrack } from "svelte";
import type { Getter } from "$lib/internal/types.js";

/**
 * The reactive value produced by `memo`. Read it via `.current`.
 */
export interface Memo<T> {
	readonly current: T;
}

class MemoImpl<T> implements Memo<T> {
	#value: T;

	constructor(compute: () => T) {
		this.#value = $derived.by(compute);
	}

	get current(): T {
		return this.#value;
	}
}

export function memo<T extends Array<unknown>, R>(
	sources: { [K in keyof T]: Getter<T[K]> },
	compute: (
		values: T,
		previousValues: { [K in keyof T]: T[K] | undefined }
	) => R
): Memo<R>;

export function memo<T, R>(
	source: Getter<T>,
	compute: (value: T, previousValue: T | undefined) => R
): Memo<R>;

export function memo<T, R>(
	sources: Getter<T> | Array<Getter<T>>,
	compute: (
		values: T | Array<T>,
		previousValues: T | undefined | Array<T | undefined>
	) => R
): Memo<R> {
	// Match `watch`'s convention: arrays start with `[]` so the callback can
	// destructure on the first run, single sources start with `undefined`.
	let previousValues: T | undefined | Array<T | undefined> = Array.isArray(sources)
		? []
		: undefined;

	return new MemoImpl(() => {
		const values = Array.isArray(sources)
			? sources.map((source) => source())
			: sources();
		const result = untrack(() => compute(values, previousValues));
		previousValues = values;
		return result;
	});
}
