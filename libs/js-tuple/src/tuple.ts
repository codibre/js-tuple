import { RefInfo } from './types';

const objectMap = Symbol('objectMap');
const value = Symbol('value');

type CacheNode = {
	[objectMap]: WeakMap<Reference, CacheNode>;
	[value]?: WeakRef<object>;
};

function createCacheNode(): CacheNode {
	return {
		[objectMap]: new WeakMap<Reference, CacheNode>(),
	};
}

const EMPTY_TUPLE: unknown = Object.freeze([]);
const tupleCache: CacheNode = createCacheNode();
const primitives = new Map<unknown, RefInfo>();
export type Reference = object & { [value]: Reference };

/**
 * Gets an object reference for any value, enabling it to be used as a WeakMap key.
 *
 * For objects (including arrays, functions, etc.), returns the object itself.
 * For primitives (string, number, boolean, null, undefined, symbol, bigint),
 * returns a cached wrapper object that represents that primitive value.
 *
 * This function ensures that the same primitive value always gets the same wrapper object,
 * enabling primitives to be used consistently in WeakMap-based caching scenarios.
 *
 * @param v - Any value to get a reference for
 * @returns An object that can be used as a WeakMap key
 *
 * @example
 * ```typescript
 * const ref1 = getRef(42);
 * const ref2 = getRef(42);
 * console.log(ref1 === ref2); // true - same wrapper for same primitive
 *
 * const obj = {};
 * const ref3 = getRef(obj);
 * console.log(ref3 === obj); // true - objects are returned as-is
 * ```
 */
export function getRef(v: unknown, basics?: RefInfo[]): Reference {
	if (typeof v === 'object' && v !== null) return v as Reference;
	let el = primitives.get(v);
	if (!el) primitives.set(v, (el = { ref: { [value]: v }, count: 0 }));
	basics?.push(el);
	return el.ref as Reference;
}

const primitiveRegistry = new FinalizationRegistry((heldValue) => {
	const current = primitives.get(heldValue);
	if (!current || current.count <= 1) primitives.delete(heldValue);
	else current.count--;
});
function registerUsage(basics: RefInfo[], result: object) {
	basics.forEach((x) => {
		x.count++;
		primitiveRegistry.register(result, x.ref);
	});
}

/**
 * Creates a cached, immutable tuple from an array of elements.
 *
 * This function returns the same frozen array instance for identical element sequences,
 * making it perfect for use as Map keys or in scenarios where reference equality is important.
 * The function maintains an internal cache using WeakMaps and WeakRefs to ensure
 * memory-efficient operation and proper garbage collection.
 *
 * Key features:
 * - **Reference equality**: Same elements always return the same instance
 * - **Immutable**: Returned arrays are frozen and cannot be modified
 * - **Memory efficient**: Uses WeakRefs for garbage collection when tuples are no longer referenced
 * - **High performance**: Optimized tree-based caching for fast lookups
 *
 * @template T - The type of the input array
 * @param elements - The array of elements to create a tuple from
 * @returns A frozen, cached array instance with the same elements
 *
 * @example
 * ```typescript
 * // Same elements return the same instance
 * const t1 = tuple([1, 2, 3]);
 * const t2 = tuple([1, 2, 3]);
 * console.log(t1 === t2); // true
 *
 * // Different elements return different instances
 * const t3 = tuple([1, 2, 4]);
 * console.log(t1 === t3); // false
 *
 * // Perfect for Map keys
 * const map = new Map();
 * map.set(tuple([1, 2]), 'value1');
 * map.set(tuple([1, 3]), 'value2');
 * console.log(map.get(tuple([1, 2]))); // 'value1'
 *
 * // Works with mixed types including objects
 * const obj = { a: 1 };
 * const t4 = tuple([obj, 'string', 42]);
 * const t5 = tuple([obj, 'string', 42]);
 * console.log(t4 === t5); // true - same object reference
 * ```
 */
export function tuple<T extends Readonly<Array<unknown>>>(
	elements: T,
): Readonly<T> {
	const length = elements.length;
	if (!length) return EMPTY_TUPLE as Readonly<T>;

	let current: CacheNode = tupleCache;
	const basics: RefInfo[] = [];

	for (let i = 0; i < length; ++i) {
		const el = getRef(elements[i], basics);

		const map = current[objectMap];
		let node = map.get(el);
		if (!node) {
			node = createCacheNode();
			map.set(el, node);
		}
		current = node;
	}

	let ref = current[value];
	let result: Readonly<T> | undefined;
	if (ref) result = ref.deref() as Readonly<T> | undefined;
	if (!result) {
		current[value] = ref = new WeakRef(
			(result = Object.freeze(elements.slice()) as Readonly<T>),
		);
		registerUsage(basics, result);
	}

	return result;
}
