import { ChunkedQueue } from './chunked-queue';
import { IterationOptions, PartialKey, TraverseMode, YieldMode } from './types';

const VAL = Symbol('value');
const SET = Symbol('valueSet');
const COUNT = Symbol('count');
const MAP = Symbol('objectMap');

type CacheNode = {
	[MAP]?: Map<unknown, CacheNode>;
	[SET]?: number;
	[VAL]?: unknown;
	[COUNT]: number;
};

type PathArray = readonly unknown[];

interface StackItem {
	node: CacheNode;
	path?: PathArray;
	visited?: boolean;
}

function treatKey<K>(nestedKey: K) {
	return Array.isArray(nestedKey) ? nestedKey : [nestedKey];
}

function getValueFactory<T extends boolean>(justValue: T) {
	return justValue
		? ({ node }: StackItem) => node[VAL]
		: <K, V>({ path, node }: StackItem) => [path as K, node[VAL] as V];
}

const EMPTY: PathArray = Object.freeze([]);

function pushToStackFactory<T extends boolean>(justValue: T) {
	return justValue
		? (stack: StackItem[] | ChunkedQueue<StackItem>, stackItem: StackItem) => {
				const { node } = stackItem;
				if (!node[MAP]?.size) return;
				for (const sub of node[MAP].values()) {
					stack.push({
						node: sub,
					});
				}
			}
		: (stack: StackItem[] | ChunkedQueue<StackItem>, stackItem: StackItem) => {
				const { node, path } = stackItem;
				if (!node[MAP]?.size) return;
				for (const [key, sub] of node[MAP].entries()) {
					stack.push({
						node: sub,
						path: [...(path as unknown[]), key],
					});
				}
			};
}

const incrementCount = (p: CacheNode): number => p[COUNT]++;

function propagateDelete(
	map: CacheNode,
	key: unknown,
	decrement: number,
	canDelete: boolean,
) {
	const nodeMap = map[MAP] as Map<unknown, CacheNode>;
	map[COUNT] -= decrement;
	if (canDelete) {
		nodeMap.delete(key);
		if (!nodeMap.size) {
			map[MAP] = undefined;
			return map[SET] !== 1;
		}
	}
	return false;
}

const getValueOpt = {
	1: getValueFactory(true),
	0: getValueFactory(false),
};

const pushToStackOpt = {
	1: pushToStackFactory(true),
	0: pushToStackFactory(false),
};

const traverser = {
	[TraverseMode.BreadthFirst]: {
		*[YieldMode.PostOrder]<K, V, T extends 0 | 1>(
			root: CacheNode,
			prevPath: PathArray,
			justValue: T,
		): MapIterator<T extends 0 ? [K, V] : V> {
			const getValue = getValueOpt[justValue] as (
				si: StackItem,
			) => T extends 0 ? [K, V] : V;
			const pushToStack = pushToStackOpt[justValue];
			// Iterative BFS collecting levels, then yield in post-order
			let queue: StackItem[] = [{ node: root, path: prevPath }];
			const levels: StackItem[][] = [];
			while (queue.length) {
				const level: StackItem[] = [];
				const nextQueue: StackItem[] = [];
				for (let i = 0; i < queue.length; i++) {
					const stackItem = queue[i] as StackItem;
					level.push(stackItem);
					pushToStack(nextQueue, stackItem);
				}
				levels.push(level);
				queue = nextQueue;
			}
			// Yield nodes in post-order (bottom-up)
			for (let i = levels.length - 1; i >= 0; i--) {
				const level = levels[i];
				if (!level) continue;
				for (let j = 0; j < level.length; j++) {
					const stackItem = level[j];
					if (stackItem?.node[SET]) yield getValue(stackItem);
				}
			}
		},
		*[YieldMode.PreOrder]<K, V, T extends 0 | 1>(
			node: CacheNode,
			path: PathArray,
			justValue: T,
		): MapIterator<T extends 0 ? [K, V] : V> {
			const queue = new ChunkedQueue({ node, path });
			const getValue = getValueOpt[justValue] as (
				si: StackItem,
			) => T extends 0 ? [K, V] : V;
			const pushToStack = pushToStackOpt[justValue];
			while (queue.length) {
				const stackItem = queue.pop() as StackItem;
				if (stackItem.node[SET]) yield getValue(stackItem);
				pushToStack(queue, stackItem);
			}
		},
	},

	[TraverseMode.DepthFirst]: {
		*[YieldMode.PostOrder]<K, V, T extends 0 | 1>(
			root: CacheNode,
			prevPath: unknown[],
			justValue: T,
		): MapIterator<T extends 0 ? [K, V] : V> {
			const stack: StackItem[] = [{ node: root, path: prevPath }];
			const getValue = getValueOpt[justValue] as (
				si: StackItem,
			) => T extends 0 ? [K, V] : V;
			const pushToStack = pushToStackOpt[justValue];
			do {
				const current = stack.pop() as StackItem;
				const { node } = current;
				if (current.visited) {
					if (node[SET]) yield getValue(current);
				} else if (!node[MAP]?.size) {
					if (node[SET]) yield getValue(current);
				} else {
					current.visited = true;
					stack.push(current);
					pushToStack(stack, current);
				}
			} while (stack.length > 0);
		},

		*[YieldMode.PreOrder]<K, V, T extends 0 | 1>(
			root: CacheNode,
			prevPath: readonly unknown[],
			justValue: T,
		): MapIterator<T extends 0 ? [K, V] : V> {
			const stack: Array<StackItem> = [{ node: root, path: prevPath }];
			const getValue = getValueOpt[justValue] as (
				si: StackItem,
			) => T extends 0 ? [K, V] : V;
			const pushToStack = pushToStackOpt[justValue];
			do {
				const current = stack.pop() as StackItem;
				if (current.node[SET]) yield getValue(current);
				pushToStack(stack, current);
			} while (stack.length > 0);
		},
	},
};

const empty = {
	1: traverser[TraverseMode.DepthFirst][YieldMode.PreOrder](
		{ [COUNT]: 0 },
		EMPTY,
		1,
	),
	0: traverser[TraverseMode.DepthFirst][YieldMode.PreOrder](
		{ [COUNT]: 0 },
		EMPTY,
		0,
	),
};

type TraverseItem<T extends 0 | 1, K, V> = T extends 0 ? [K, V] : V;

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
	#basePath?: PartialKey<K>;
	#baseNode?: CacheNode[];
	#root: CacheNode = {
		[COUNT]: 0,
	};

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
		return this.#root[COUNT];
	}

	#getOrCreateNode(nestedKey: PartialKey<K> | undefined, path: CacheNode[]) {
		if (nestedKey === undefined) return this.#root;
		const keyArray = treatKey(nestedKey);
		let current = this.#root;
		path.push(current);

		// Navigate/create the path
		for (let i = 0; i < keyArray.length; i++) {
			const key = keyArray[i];
			const map = (current[MAP] ??= new Map());
			let next: CacheNode = map.get(key);
			if (!next) {
				next = {
					[COUNT]: 0,
				};
				map.set(key, next);
			}
			path.push(next);
			current = next;
		}
		return current;
	}

	#internalSet(current: CacheNode, value: V, path: CacheNode[]) {
		const isNewEntry = current[SET] !== 1;

		// Store the actual value using the special VALUE_KEY
		current[VAL] = value;

		if (isNewEntry) {
			path.forEach(incrementCount);
			this.#baseNode?.forEach(incrementCount);
			current[SET] = 1;
		}
	}

	/**
	 * Stores a value with the given array key.
	 *
	 * @param keyArray - The array to use as the key
	 * @param value - The value to store
	 * @returns This NestedMap instance for chaining
	 */
	set(nestedKey: K, value: V): this {
		const path: CacheNode[] = [];
		const current = this.#getOrCreateNode(nestedKey, path);

		// Check if this is a new entry by seeing if VALUE_KEY already exists
		this.#internalSet(current, value, path);

		return this;
	}

	#getNode(nestedKey: PartialKey<K>) {
		const keyArray = Array.isArray(nestedKey) ? nestedKey : [nestedKey];
		let current = this.#root;
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
		const path: CacheNode[] = [];
		const node = this.#getOrCreateNode(nestedKey, path);
		if (node[VAL] !== undefined) return node[VAL] as T;
		const value = getNewValue(nestedKey);
		this.#internalSet(node, value, path);
		return value;
	}

	/**
	 * Gets the value associated with the given array key.
	 *
	 * @param keyArray - The array key to look up
	 * @returns The value if found, undefined otherwise
	 */
	get(keyArray: K): V | undefined {
		return this.#getNode(keyArray)?.[VAL] as V | undefined;
	}

	/**
	 * Checks if the map contains a value for the given array key.
	 *
	 * @param keyArray - The array key to check
	 * @returns True if the key exists, false otherwise
	 */
	has(keyArray: K): boolean {
		return this.#getNode(keyArray)?.[VAL] !== undefined;
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
		let current = this.#root;

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
		let decrement = current[SET] ? 1 : 0;
		current[SET] = 0;

		// Clean up empty Maps from the bottom up
		if (deleteSubTree) {
			decrement = current[COUNT];
			current[MAP] = undefined;
		}
		let canDelete = !current[MAP]?.size;
		for (let i = path.length - 1; i >= 0; i--) {
			const { map, key } = path[i] as Required<(typeof path)[0]>;
			canDelete = propagateDelete(map, key, decrement, canDelete);
		}

		const baseNode = this.#baseNode;
		if (!baseNode?.length || !this.#basePath) return true;
		const basePath = treatKey(this.#basePath);
		for (let i = baseNode.length - 1; i >= 0; i--) {
			const map = baseNode[i] as CacheNode;
			const key = basePath[i];
			canDelete = propagateDelete(map, key, decrement, canDelete);
		}

		return true;
	}

	/**
	 * Removes all entries from the map.
	 */
	clear(): void {
		this.#root[MAP]?.clear();
		this.#root[COUNT] = 0;
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

	#traverse<T extends 0 | 1>(
		justValue: T,
		options: IterationOptions<K> = {},
	): MapIterator<TraverseItem<T, K, V>> {
		const {
			basePath,
			traverseMode = TraverseMode.DepthFirst,
			yieldMode = YieldMode.PreOrder,
		} = options;
		let root: CacheNode | undefined;
		const prevPath: unknown[] = [];
		if (basePath) {
			root = this.#getNode(basePath);
			if (!root) return empty[justValue] as MapIterator<TraverseItem<T, K, V>>;
			if (Array.isArray(basePath)) prevPath.push(...basePath);
			else prevPath.push(basePath);
		} else root = this.#root;
		return traverser[traverseMode][yieldMode](root, prevPath, justValue);
	}

	/**
	 * Returns an iterator of key-value pairs.
	 */
	entries(options?: IterationOptions<K>): MapIterator<[K, V]> {
		return this.#traverse(0, options);
	}

	/**
	 * Returns an iterator of keys.
	 */
	*keys(options?: IterationOptions<K>): MapIterator<K> {
		for (const [key] of this.entries(options)) yield key;
	}

	/**
	 * Returns an iterator of values.
	 */
	values(options: IterationOptions<K> = {}): MapIterator<V> {
		return this.#traverse(1, options);
	}

	/**
	 * Returns the default iterator (same as entries()).
	 */
	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.#traverse(0, {});
	}

	/**
	 * Returns the string tag for this object.
	 */
	get [Symbol.toStringTag](): string {
		return 'NestedMap';
	}

	/**
	 * Creates a new NestedMap instance that represents a subtree starting from the specified basePath.
	 * The new NestedMap is a view from the same structure and values as the original map for the specified subtree.
	 * Changes to the subtree in the new map will be reflected in the original map and vice versa.
	 * @param basePath - The path to the subtree root
	 * @returns A new NestedMap instance exposing the subtree
	 */
	getSubMap(basePath: PartialKey<K>): NestedMap<K, V> {
		const result = new NestedMap<K, V>();
		const baseNode: CacheNode[] = [];
		result.#root = this.#getOrCreateNode(basePath, baseNode);
		result.#baseNode = baseNode;
		result.#basePath = basePath;
		return result;
	}

	/**
	 * Efficiently deep clones the NestedMap or a subtree if basePath is provided (O(N)), using BFS pre-order for insertion order preservation.
	 * @param basePath - Optional path to clone only a subtree
	 * @returns A new NestedMap instance with the same structure and values
	 */
	clone(basePath?: PartialKey<K>): NestedMap<K, V> {
		let sourceNode = this.#root;
		let base: unknown[] = [];
		if (basePath) {
			const found = this.#getNode(basePath);
			if (!found) return new NestedMap<K, V>();
			sourceNode = found;
			base = treatKey(basePath);
		}
		const result = new NestedMap<K, V>();
		const queue = new ChunkedQueue({
			src: sourceNode,
			tgt: result.#root,
			path: base,
		});
		queue.exhaust(({ src, tgt, path }) => {
			tgt[COUNT] = src[COUNT];
			if (src[SET]) tgt[SET] = src[SET];
			if (src[VAL] !== undefined) tgt[VAL] = src[VAL];
			if (src[MAP]) {
				tgt[MAP] = new Map();
				for (const [key, child] of src[MAP].entries()) {
					const childTgt: CacheNode = { [COUNT]: child[COUNT] };
					tgt[MAP].set(key, childTgt);
					queue.push({ src: child, tgt: childTgt, path: [...path, key] });
				}
			}
		});
		return result;
	}

	/**
	 * Returns the number of entries in the subtree rooted at the specified nested key.
	 * The entries considered are all the values set at or below the specified key.
	 * @param nestedKey
	 * @returns The count of entries in the subtree, or 0 if the key does not exist.
	 */
	nodeSize(nestedKey: PartialKey<K>): number {
		const node = this.#getNode(nestedKey);
		return node?.[COUNT] ?? 0;
	}
}
