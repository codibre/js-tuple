// Utility type to get all prefixes of a tuple type
// Helper type to prepend an element to all tuples in a union
type PrependToAll<T, U> = T extends unknown[] ? [U, ...T] : never;

// Utility type to get all prefixes of a tuple type, including the full tuple
export type TuplePrefixes<T extends unknown[]> = T extends []
	? [[]]
	: T extends [infer First, ...infer Rest]
		? [[] | [First], ...PrependToAll<TuplePrefixes<Rest>[number], First>]
		: never;

// For NestedMap, a partial key is any prefix of the key tuple, or K itself if not an array
export type PartialKey<K> =
	| K
	| (K extends unknown[] ? TuplePrefixes<K>[number] : K);

export enum TraverseMode {
	DepthFirst = 'depth-first',
	BreadthFirst = 'breadth-first',
}

export enum YieldMode {
	PreOrder = 'pre-order',
	PostOrder = 'post-order',
}

export type IterationOptions<K> = {
	basePath?: PartialKey<K>;
	traverseMode?: TraverseMode;
	yieldMode?: YieldMode;
};

export type RefInfo = {
	ref: object;
	count: number;
};
