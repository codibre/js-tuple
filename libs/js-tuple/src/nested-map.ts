const VALUE_KEY = Symbol('value');

/**
 * A Map implementation that uses arrays as keys by storing them in a nested Map structure.
 *
 * This class provides a way to use arrays as Map keys by creating a tree-like structure
 * where each element of the array becomes a level in the tree. The actual value is stored
 * at the leaf node using a special symbol key.
 *
 * Key features:
 * - **Array keys**: Use arrays of any type as Map keys
 * - **Value-based equality**: Arrays with the same elements in the same order are considered equal
 * - **Efficient lookup**: Fast O(n) lookup where n is the array length
 * - **Map-like interface**: Provides familiar Map methods and iteration
 *
 * @template K - The array type used as keys (must extend unknown[])
 * @template V - The type of values stored in the map
 *
 * @example
 * ```typescript
 * const map = new NestedMap<[number, string], string>();
 *
 * map.set([1, 'hello'], 'value1');
 * map.set([2, 'world'], 'value2');
 *
 * console.log(map.get([1, 'hello'])); // 'value1'
 * console.log(map.has([1, 'hello'])); // true
 * console.log(map.size); // 2
 *
 * // Arrays with same elements are considered equal
 * const key1 = [1, 'hello'];
 * const key2 = [1, 'hello'];
 * map.set(key1, 'first');
 * map.set(key2, 'second'); // overwrites 'first'
 * console.log(map.get([1, 'hello'])); // 'second'
 * ```
 */
export class NestedMap<K, V> {
	private readonly root = new Map<unknown, unknown>();
	private _size = 0;

	/**
	 * Creates a new NestedMap instance.
	 *
	 * @param entries - Optional iterable of key-value pairs to initialize the map
	 */
	constructor(entries?: Iterable<readonly [K, V]>) {
		if (entries) {
			for (const [key, value] of entries) {
				this.set(key, value);
			}
		}
	}

	/**
	 * Gets the number of key-value pairs in the map.
	 */
	get size(): number {
		return this._size;
	}

	private getOrCreateNode(nestedKey: K) {
		const keyArray = Array.isArray(nestedKey) ? nestedKey : [nestedKey];
		let current = this.root;

		// Navigate/create the path
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			let next = current.get(key);
			if (!next) current.set(key, (next = new Map()));
			current = next as Map<unknown, unknown>;
		}
		return current;
	}

	/**
	 * Stores a value with the given array key.
	 *
	 * @param keyArray - The array to use as the key
	 * @param value - The value to store
	 * @returns This NestedMap instance for chaining
	 */
	set(nestedKey: K, value: V): this {
		const current = this.getOrCreateNode(nestedKey);

		// Check if this is a new entry by seeing if VALUE_KEY already exists
		const isNewEntry = !current.has(VALUE_KEY);

		// Store the actual value using the special VALUE_KEY
		current.set(VALUE_KEY, value);

		if (isNewEntry) this._size++;

		return this;
	}

	private getNode(nestedKey: K) {
		const keyArray = Array.isArray(nestedKey) ? nestedKey : [nestedKey];
		let current = this.root;

		// Navigate/create the path
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			const next = current.get(key);
			if (!next) return undefined;
			current = next as Map<unknown, unknown>;
		}

		return current;
	}

	/**
	 * Gets the value associated with the given array key, or sets a new value if it doesn't exist.
	 *
	 * @param nestedKey - The array key to look up
	 * @param getNewValue - A function to generate a new value if the key doesn't exist
	 * @returns The existing or newly created value
	 */
	getOrSet(nestedKey: K, getNewValue: () => V): V {
		const node = this.getOrCreateNode(nestedKey);
		if (node?.has(VALUE_KEY)) return node.get(VALUE_KEY) as V;
		const value = getNewValue();
		this.set(nestedKey, value);
		return value;
	}

	/**
	 * Gets the value associated with the given array key.
	 *
	 * @param keyArray - The array key to look up
	 * @returns The value if found, undefined otherwise
	 */
	get(keyArray: K): V | undefined {
		return this.getNode(keyArray)?.get(VALUE_KEY) as V | undefined;
	}

	/**
	 * Checks if the map contains a value for the given array key.
	 *
	 * @param keyArray - The array key to check
	 * @returns True if the key exists, false otherwise
	 */
	has(keyArray: K): boolean {
		return this.getNode(keyArray)?.has(VALUE_KEY) ?? false;
	}

	/**
	 * Removes the entry for the given array key.
	 *
	 * @param keyArray - The array key to remove
	 * @returns True if the entry was removed, false if it didn't exist
	 */
	delete(nestedKey: K): boolean {
		const keyArray = Array.isArray(nestedKey) ? nestedKey : [nestedKey];

		const path: Array<{ map: Map<unknown, unknown>; key: unknown }> = [];
		let current = this.root;

		// Navigate the path and record it for cleanup
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			path.push({ map: current, key });
			const map = current.get(key) as Map<unknown, unknown> | undefined;
			if (!map) return false;
			current = map;
		}

		// Remove the value
		if (!current.delete(VALUE_KEY)) return false;
		this._size--;

		// Clean up empty Maps from the bottom up
		if (current.size > 0) return true;
		for (let i = path.length - 1; i >= 0; i--) {
			const pathItem = path[i];
			if (pathItem) {
				const { map, key } = pathItem;
				if (map.size > 0) break;
				map.delete(key);
			}
		}

		return true;
	}

	/**
	 * Removes all entries from the map.
	 */
	clear(): void {
		this.root.clear();
		this._size = 0;
	}

	/**
	 * Executes a callback function for each key-value pair in the map.
	 *
	 * @param callbackfn - Function to execute for each entry
	 * @param thisArg - Value to use as 'this' when executing the callback
	 */
	forEach(
		callbackfn: (value: V, key: K, map: NestedMap<K, V>) => void,
		thisArg?: unknown,
	): void {
		for (const [key, value] of this.entries()) {
			callbackfn.call(thisArg, value, key, this);
		}
	}

	/**
	 * Returns an iterator of key-value pairs.
	 */
	*entries(): IterableIterator<[K, V]> {
		yield* this._traverse(this.root, []);
	}

	/**
	 * Returns an iterator of keys.
	 */
	*keys(): MapIterator<K> {
		for (const [key] of this.entries()) {
			yield key;
		}
	}

	/**
	 * Returns an iterator of values.
	 */
	*values(): MapIterator<V> {
		for (const [, value] of this.entries()) {
			yield value;
		}
	}

	/**
	 * Returns the default iterator (same as entries()).
	 */
	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.entries();
	}

	/**
	 * Returns the string tag for this object.
	 */
	get [Symbol.toStringTag](): string {
		return 'NestedMap';
	}

	/**
	 * Internal method to traverse the nested map structure and yield entries.
	 */

	/**
	 * Internal method to traverse the nested map structure and yield entries using a stack-based approach.
	 * This avoids recursion and potential stack overflow issues for deeply nested structures.
	 */
	private *_traverse(
		root: Map<unknown, unknown>,
		currentPath: unknown[],
	): IterableIterator<[K, V]> {
		// Stack to store {node, path} pairs for traversal
		const stack: Array<{ node: Map<unknown, unknown>; path: unknown[] }> = [
			{ node: root, path: currentPath },
		];

		while (stack.length > 0) {
			const { node, path } = stack.pop() as {
				node: Map<unknown, unknown>;
				path: unknown[];
			};

			for (const [key, value] of node.entries()) {
				if (key === VALUE_KEY) {
					// Found a leaf value
					yield [path as unknown as K, value as V];
				} else if (value instanceof Map) {
					// Add to stack for later processing (LIFO order maintains depth-first traversal)
					stack.push({ node: value, path: [...path, key] });
				}
			}
		}
	}
}
