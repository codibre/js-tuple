const primitives = new Map<unknown, object>();

const value = Symbol('value');
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
export function getRef(v: unknown): Reference {
	if (typeof v === 'object' && v !== null) return v as Reference;
	let el = primitives.get(v);
	if (!el) primitives.set(v, (el = { [value]: v }));
	return el as Reference;
}
