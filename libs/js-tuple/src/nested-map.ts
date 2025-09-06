import { PartialKey } from './types';

const VAL = Symbol('value');
const SET = Symbol('valueSet');
const MAP = Symbol('objectMap');

type CacheNode = {
	[MAP]?: Map<unknown, CacheNode>;
	[SET]?: number;
	[VAL]?: unknown;
};

function treatKey<K>(nestedKey: K) {
	return Array.isArray(nestedKey) ? nestedKey : [nestedKey];
}

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
	private readonly _root: CacheNode = {};

	private _size = 0;

	/**
	 * Creates a new NestedMap instance.
	 *
	 * @param entries - Optional iterable of key-value pairs to initialize the map
	 */
	constructor(entries?: Iterable<readonly [K, V]>) {
		if (!entries) return;
		for (const [key, value] of entries) {
			this.set(key, value);
		}
	}

	/**
	 * Gets the number of key-value pairs in the map.
	 */
	get size(): number {
		return this._size;
	}

	private _getOrCreateNode(nestedKey: K) {
		const keyArray = treatKey(nestedKey);
		let current = this._root;

		// Navigate/create the path
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			const map = (current[MAP] ??= new Map());
			let next = map.get(key);
			if (!next) map.set(key, (next = {}));
			current = next;
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
		const current = this._getOrCreateNode(nestedKey);

		// Check if this is a new entry by seeing if VALUE_KEY already exists
		const isNewEntry = current[SET] !== 1;

		// Store the actual value using the special VALUE_KEY
		current[VAL] = value;

		if (isNewEntry) {
			this._size++;
			current[SET] = 1;
		}

		return this;
	}

	private _getNode(nestedKey: PartialKey<K>) {
		const keyArray = Array.isArray(nestedKey) ? nestedKey : [nestedKey];
		let current = this._root;
		// Navigate/create the path
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			const next = current[MAP]?.get(key);
			if (!next) return undefined;
			current = next;
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
	getOrSet<T extends V>(nestedKey: K, getNewValue: (nestedKey: K) => T): T {
		const node = this._getOrCreateNode(nestedKey);
		if (node?.[VAL] !== undefined) return node[VAL] as T;
		const value = getNewValue(nestedKey);
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
		return this._getNode(keyArray)?.[VAL] as V | undefined;
	}

	/**
	 * Checks if the map contains a value for the given array key.
	 *
	 * @param keyArray - The array key to check
	 * @returns True if the key exists, false otherwise
	 */
	has(keyArray: K): boolean {
		return this._getNode(keyArray)?.[VAL] !== undefined;
	}

	/**
	 * Removes the entry for the given array key.
	 *
	 * @param keyArray - The array key to remove
	 * @param deleteSubTree true is nodes below the specified one may be delete. Example: deleting [1, 2] may delete [1, 2, 3] if this parameter is true. Default false
	 * @returns True if the entry was removed, false if it didn't exist
	 */
	delete(nestedKey: K, deleteSubTree = false): boolean {
		const keyArray = treatKey(nestedKey);

		const path: Array<{ map: CacheNode; key: unknown }> = [];
		let current = this._root;

		// Navigate the path and record it for cleanup
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			path.push({ map: current, key });
			const map = current[MAP]?.get(key);
			if (!map) return false;
			current = map;
		}

		if (!current[SET] && (!deleteSubTree || !current[MAP]?.size)) {
			return false;
		}
		// Remove the value
		current[VAL] = undefined;
		current[SET] = 0;
		this._size--;

		// Clean up empty Maps from the bottom up
		if (current[MAP]?.size) {
			if (!deleteSubTree) return true;
			current[MAP] = undefined;
		}
		for (let i = path.length - 1; i >= 0; i--) {
			const pathItem = path[i] as Required<(typeof path)[0]>;
			const nodeMap = pathItem.map[MAP] as Map<unknown, CacheNode>;
			const { map, key } = pathItem;
			nodeMap.delete(key);
			if (nodeMap.size) break;
			map[MAP] = undefined;
		}

		return true;
	}

	/**
	 * Removes all entries from the map.
	 */
	clear(): void {
		this._root[MAP]?.clear();
		this._size = 0;
	}

	/**
	 * Executes a callback function for each key-value pair in the map.
	 *
	 * @param callbackfn - Function to execute for each entry
	 * @param thisArg - Value to use as 'this' when executing the callback
	 */
	forEach(
		callbackfn: (value: V, key: PartialKey<K>, map: NestedMap<K, V>) => void,
		thisArg?: unknown,
	): void {
		for (const [key, value] of this.entries()) {
			callbackfn.call(thisArg, value, key, this);
		}
	}

	/**
	 * Returns an iterator of key-value pairs.
	 */
	*entries(basePath?: PartialKey<K>): IterableIterator<[K, V]> {
		let root: CacheNode | undefined;
		const prevPath: unknown[] = [];
		if (basePath) {
			root = this._getNode(basePath);
			if (!root) return;
			if (Array.isArray(basePath)) prevPath.push(...basePath);
			else prevPath.push(basePath);
		} else root = this._root;
		// Stack to store {node, path} pairs for traversal
		const stack = [{ node: root, path: prevPath }];

		while (stack.length > 0) {
			const { node, path } = stack.pop() as {
				node: CacheNode;
				path: unknown[];
			};

			for (const [key, sub] of node[MAP]?.entries() ?? []) {
				const newPath = [...path, key];
				if (sub[SET]) yield [newPath as unknown as K, sub[VAL] as V];
				// Add to stack for later processing (LIFO order maintains depth-first traversal)
				if (sub[MAP]) stack.push({ node: sub, path: newPath });
			}
		}
	}

	/**
	 * Returns an iterator of keys.
	 */
	*keys(basePath?: PartialKey<K>): MapIterator<K> {
		for (const [key] of this.entries(basePath)) yield key;
	}

	/**
	 * Returns an iterator of values.
	 */
	*values(basePath?: PartialKey<K>): MapIterator<V> {
		for (const [, value] of this.entries(basePath)) yield value;
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
}
