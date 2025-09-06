import { TraverseMode, YieldMode } from 'src/types';
import { NestedSet } from '../src/nested-set';

describe('NestedSet', () => {
	it('has correct Symbol.toStringTag', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();

		// Act & Assert
		expect(Object.prototype.toString.call(set)).toBe('[object NestedSet]');
	});

	it('returns all keys with keys()', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		set.add([1, 'foo']);
		set.add([2, 'bar']);

		// Act
		const keys = Array.from(set.keys());

		// Assert
		expect(keys).toContainEqual([1, 'foo']);
		expect(keys).toContainEqual([2, 'bar']);
		expect(keys.length).toBe(2);
	});

	it('returns all values with values()', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		set.add([1, 'foo']);
		set.add([2, 'bar']);

		// Act
		const values = Array.from(set.values());

		// Assert
		expect(values).toContainEqual([1, 'foo']);
		expect(values).toContainEqual([2, 'bar']);
		expect(values.length).toBe(2);
	});
	it('adds and checks values', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		const key: [number, string] = [1, 'a'];

		// Act
		set.add(key);

		// Assert
		expect(set.has(key)).toBe(true);
		expect(set.size).toBe(1);
	});

	it('does not add duplicate values', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		const key: [number, string] = [2, 'b'];

		// Act
		set.add(key);
		set.add(key);

		// Assert
		expect(set.size).toBe(1);
	});

	it('deletes values', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		const key: [number, string] = [3, 'c'];
		set.add(key);

		// Act
		const deleted = set.delete(key);

		// Assert
		expect(deleted).toBe(true);
		expect(set.has(key)).toBe(false);
		expect(set.size).toBe(0);
	});

	it('clears all values', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		set.add([1, 'x']);
		set.add([2, 'y']);

		// Act
		set.clear();

		// Assert
		expect(set.size).toBe(0);
		expect(set.has([1, 'x'])).toBe(false);
		expect(set.has([2, 'y'])).toBe(false);
	});

	it('iterates values', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		set.add([1, 'foo']);
		set.add([2, 'bar']);
		const results: Array<[number, string]> = [];

		// Act
		for (const value of set) {
			results.push(value);
		}

		// Assert
		expect(results).toContainEqual([1, 'foo']);
		expect(results).toContainEqual([2, 'bar']);
		expect(results.length).toBe(2);
	});

	it('forEach iterates all values', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		set.add([1, 'foo']);
		set.add([2, 'bar']);
		const called: Array<[number, string]> = [];

		// Act
		set.forEach((value) => {
			called.push(value);
		});

		// Assert
		expect(called).toContainEqual([1, 'foo']);
		expect(called).toContainEqual([2, 'bar']);
		expect(called.length).toBe(2);
	});

	it('does not increase size for different array instances with same values', () => {
		// Arrange
		const set = new NestedSet<[number, string]>();
		const arr1: [number, string] = [5, 'same'];
		const arr2: [number, string] = [5, 'same']; // different instance, same values

		// Act
		set.add(arr1);
		set.add(arr2);

		// Assert
		expect(set.size).toBe(1);
		expect(set.has(arr1)).toBe(true);
		expect(set.has(arr2)).toBe(true);
	});

	it('should traverse all nodes in depth-first order (pre-order)', () => {
		// Arrange
		const set = new NestedSet();
		set.add([1]);
		set.add([1, 2]);
		set.add([1, 2, 4]);
		set.add([1, 3]);
		set.add([1, 3, 5]);

		// Act
		const keys = Array.from(
			set.entries({ traverseMode: TraverseMode.DepthFirst }),
		).map(([k]) => k);

		// Assert: Depth-first order (pre-order)
		expect(keys).toEqual([[1], [1, 3], [1, 3, 5], [1, 2], [1, 2, 4]]);
	});

	it('should traverse all nodes in depth-first order (post-order)', () => {
		// Arrange
		const set = new NestedSet<unknown[]>();
		set.add([1]);
		set.add([1, 2]);
		set.add([1, 2, 4]);
		set.add([1, 3]);
		set.add([1, 3, 5]);

		// Act
		const keys = Array.from(
			set.entries({
				traverseMode: TraverseMode.DepthFirst,
				yieldMode: YieldMode.PostOrder,
			}),
		).map(([k]) => k);

		// Assert: Depth-first order (post-order)
		expect(keys).toEqual([[1, 3, 5], [1, 3], [1, 2, 4], [1, 2], [1]]);
	});

	it('should traverse all nodes in breadth-first order (pre-order)', () => {
		// Arrange
		const set = new NestedSet();
		set.add([1]);
		set.add([1, 2]);
		set.add([1, 2, 4]);
		set.add([1, 3]);
		set.add([1, 3, 5]);

		// Act
		const keys = Array.from(
			set.entries({ traverseMode: TraverseMode.BreadthFirst }),
		).map(([k]) => k);

		// Assert: Breadth-first order (pre-order)
		expect(keys).toEqual([[1], [1, 2], [1, 3], [1, 2, 4], [1, 3, 5]]);
	});

	it('should traverse all nodes in breadth-first order (post-order)', () => {
		// Arrange
		const set = new NestedSet();
		set.add([1]);
		set.add([1, 2]);
		set.add([1, 2, 4]);
		set.add([1, 3]);
		set.add([1, 3, 5]);

		// Act
		const keys = Array.from(
			set.entries({
				traverseMode: TraverseMode.BreadthFirst,
				yieldMode: YieldMode.PostOrder,
			}),
		).map(([k]) => k);

		// Assert: Breadth-first order (post-order)
		expect(keys).toEqual([[1, 2, 4], [1, 3, 5], [1, 2], [1, 3], [1]]);
	});

	it('should return no entries if basePath does not exist', () => {
		// Arrange
		const set = new NestedSet();
		set.add([1, 2]);

		// Act
		const entries = Array.from(set.entries({ basePath: [9, 9] }));

		// Assert
		expect(entries).toEqual([]);
	});

	it('should not yield nodes with no value but with children', () => {
		// Arrange
		const set = new NestedSet();
		set.add([1]);
		set.add([1, 2]);
		set.add([1, 2, 3]);
		// Remove [1, 2] but keep its subnode
		set.delete([1, 2]);

		// Act
		const keys = Array.from(set.entries()).map(([k]) => k);

		// Assert
		expect(keys).toContainEqual([1]);
		expect(keys).toContainEqual([1, 2, 3]);
		expect(keys).not.toContainEqual([1, 2]);
	});
});
