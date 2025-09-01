import { AnyTuple } from './types';

// Helper type for the cache node
type Primitive = string | number | boolean | symbol | null | undefined | bigint;
type PrimitiveMap = Map<Primitive, CacheNode | object>;
type CacheNode = {
	objectMap: WeakMap<object, CacheNode | object>;
	primitiveMap: PrimitiveMap;
};

function createCacheNode(): CacheNode {
	return {
		objectMap: new WeakMap<object, CacheNode | object>(),
		primitiveMap: new Map<Primitive, CacheNode | object>(),
	};
}

const EMPTY_TUPLE: readonly [] = Object.freeze([]);
const tupleCache: CacheNode = createCacheNode();

export function tuple(elements: AnyTuple) {
	if (elements.length === 0) return EMPTY_TUPLE;

	let current: CacheNode = tupleCache;
	for (let i = 0; i < elements.length - 1; ++i) {
		const el = elements[i];
		let nextNode: CacheNode;
		if (typeof el === 'object' && el !== null) {
			if (!current.objectMap.has(el)) {
				nextNode = createCacheNode();
				current.objectMap.set(el, nextNode);
			} else {
				const val = current.objectMap.get(el);
				if (
					val &&
					typeof val === 'object' &&
					'objectMap' in val &&
					'primitiveMap' in val
				) {
					nextNode = val;
				} else {
					nextNode = createCacheNode();
					current.objectMap.set(el, nextNode);
				}
			}
			current = nextNode;
		} else {
			if (!current.primitiveMap.has(el as Primitive)) {
				nextNode = createCacheNode();
				current.primitiveMap.set(el as Primitive, nextNode);
			} else {
				const val = current.primitiveMap.get(el as Primitive);
				if (
					val &&
					typeof val === 'object' &&
					'objectMap' in val &&
					'primitiveMap' in val
				) {
					nextNode = val;
				} else {
					nextNode = createCacheNode();
					current.primitiveMap.set(el as Primitive, nextNode);
				}
			}
			current = nextNode;
		}
	}
	const last = elements[elements.length - 1];
	let tupleObj: object;
	if (typeof last === 'object' && last !== null) {
		if (!current.objectMap.has(last)) {
			tupleObj = Object.freeze([...elements]);
			current.objectMap.set(last, tupleObj);
		}
		const result = current.objectMap.get(last);
		return result && Array.isArray(result)
			? result
			: ([] as unknown as typeof elements);
	} else {
		if (!current.primitiveMap.has(last as Primitive)) {
			tupleObj = Object.freeze([...elements]);
			current.primitiveMap.set(last as Primitive, tupleObj);
		}
		const result = current.primitiveMap.get(last as Primitive);
		return result && Array.isArray(result)
			? result
			: ([] as unknown as typeof elements);
	}
}
