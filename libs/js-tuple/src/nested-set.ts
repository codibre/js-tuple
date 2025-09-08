import { NestedMap } from './nested-map';
import { IterationOptions, PartialKey } from './types';

export interface NestedSet<K> extends Set<K> {}
export class NestedSet<K> implements Set<K> {
	#map = new NestedMap<K, 1>();

	add(value: K): this {
		this.#map.set(value, 1);
		return this;
	}
	clear(): void {
		this.#map.clear();
	}
	delete(value: K): boolean {
		return this.#map.delete(value);
	}
	forEach(
		callbackfn: (value: K, value2: K, set: Set<K>) => void,
		thisArg?: unknown,
	): void {
		thisArg ??= this;
		this.#map.forEach.call(
			thisArg,
			(_, k: K) => callbackfn(k, k, this),
			thisArg,
		);
	}
	has(value: K): boolean {
		return this.#map.has(value);
	}

	get size(): number {
		return this.#map.size;
	}

	*entries(options?: IterationOptions<K>): SetIterator<[K, K]> {
		for (const key of this.#map.keys(options)) {
			yield [key, key];
		}
	}

	keys(options?: IterationOptions<K>): SetIterator<K> {
		return this.#map.keys(options);
	}

	values(options?: IterationOptions<K>): SetIterator<K> {
		return this.#map.keys(options);
	}

	[Symbol.iterator](): SetIterator<K> {
		return this.#map.keys();
	}

	get [Symbol.toStringTag](): string {
		return 'NestedSet';
	}

	/**
	 * Creates a new NestedSet instance that represents a subtree starting from the specified basePath.
	 * The new NestedSet is a view from the same structure and values as the original map for the specified subtree.
	 * Changes to the subtree in the new map will be reflected in the original map and vice versa.
	 * @param basePath - The path to the subtree root
	 * @returns A new NestedSet instance exposing the subtree
	 */
	getSubSet(basePath: PartialKey<K>): NestedSet<K> {
		const map = this.#map.getSubMap(basePath);
		const result = new NestedSet<K>();
		result.#map = map;
		return result;
	}

	/**
	 * Efficiently deep clones the NestedSet or a subtree if basePath is provided (O(N)), using BFS pre-order for insertion order preservation.
	 * @param basePath - Optional path to clone only a subtree
	 * @returns A new NestedSet instance with the same structure and values
	 */
	clone(basePath?: PartialKey<K>): NestedSet<K> {
		const result = new NestedSet<K>();
		result.#map = this.#map.clone(basePath);
		return result;
	}
}
