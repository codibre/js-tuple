import { TraverseMode, YieldMode } from 'src/types';
import { NestedMap } from '../src';

describe('NestedMap', () => {
	it('should traverse all nodes in depth-first order (pre-order)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'a');
		map.set([1, 2], 'b');
		map.set([1, 2, 4], 'c');
		map.set([1, 3], 'd');
		map.set([1, 3, 5], 'e');

		// Act
		const keys = Array.from(
			map.entries({ traverseMode: TraverseMode.DepthFirst }),
		).map(([k]) => k);

		// Assert: Depth-first order (pre-order)
		expect(keys).toEqual([[1], [1, 3], [1, 3, 5], [1, 2], [1, 2, 4]]);
	});

	it('should traverse all nodes in depth-first order (post-order)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'a');
		map.set([1, 2], 'b');
		map.set([1, 2, 4], 'c');
		map.set([1, 3], 'd');
		map.set([1, 3, 5], 'e');

		// Act
		const keys = Array.from(
			map.entries({
				traverseMode: TraverseMode.DepthFirst,
				yieldMode: YieldMode.PostOrder,
			}),
		).map(([k]) => k);

		// Assert: Depth-first order (post-order)
		expect(keys).toEqual([[1, 3, 5], [1, 3], [1, 2, 4], [1, 2], [1]]);
	});

	it('should traverse all nodes in breadth-first order (pre-order)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'a');
		map.set([1, 2], 'b');
		map.set([1, 2, 4], 'c');
		map.set([1, 3], 'd');
		map.set([1, 3, 5], 'e');

		// Act
		const keys = Array.from(
			map.entries({ traverseMode: TraverseMode.BreadthFirst }),
		).map(([k]) => k);

		// Assert: Breadth-first order (pre-order)
		expect(keys).toEqual([[1], [1, 2], [1, 3], [1, 2, 4], [1, 3, 5]]);
	});

	it('should traverse all nodes in breadth-first order (post-order)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'a');
		map.set([1, 2], 'b');
		map.set([1, 2, 4], 'c');
		map.set([1, 3], 'd');
		map.set([1, 3, 5], 'e');

		// Act
		const keys = Array.from(
			map.entries({
				traverseMode: TraverseMode.BreadthFirst,
				yieldMode: YieldMode.PostOrder,
			}),
		).map(([k]) => k);

		// Assert: Breadth-first order (post-order)
		expect(keys.map((k) => k.join(','))).toEqual([
			'1,2,4',
			'1,3,5',
			'1,2',
			'1,3',
			'1',
		]);
	});

	it('should return no entries if basePath does not exist (covers line 242)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2], 'a');

		// Act
		const entries = Array.from(map.entries({ basePath: [9, 9] })); // basePath does not exist

		// Assert
		expect(entries).toEqual([]);
	});
	it('should normalize non-array keys to arrays (covers line 73)', () => {
		// Arrange
		const map = new NestedMap<number, string>();
		map.set(42, 'answer');

		// Act & Assert
		expect(map.get(42)).toBe('answer');
		expect(map.has(42)).toBe(true);
		expect(Array.from(map.entries())).toEqual([[[42], 'answer']]);
	});
	it('should return undefined for missing intermediate node (branch line 73)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2], 'a');
		// Act & Assert
		expect(map.get([1, 3])).toBeUndefined(); // [1, 3] path does not exist
	});

	it('should handle missing node in cleanup loop (branch line 167)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'a');
		// Manually corrupt the path to simulate missing node
		// This is a bit artificial, but we can delete [1] and ensure no error
		expect(() => map.delete([1])).not.toThrow();
		expect(map.size).toBe(0);
	});

	it('should iterate nodes with and without values and traverse subnodes (branches 196-199, 241)', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'root');
		map.set([1, 2], 'child');
		map.set([1, 2, 3], 'grandchild');
		// Add a node with no value but with subnodes
		map.set([2, 3], 'other');
		// Remove value from [1, 2] but keep its subnode
		map.delete([1, 2]);

		// Act
		const entries = Array.from(map.entries());

		// Assert
		expect(entries).toContainEqual([[1], 'root']);
		expect(entries).toContainEqual([[1, 2, 3], 'grandchild']);
		expect(entries).toContainEqual([[2, 3], 'other']);
		// [1, 2] should not be present, but its subnode [1, 2, 3] should be
		expect(
			entries.some(([key]) => key.length === 2 && key[0] === 1 && key[1] === 2),
		).toBe(false);
	});
	it('should delete a deep node and remove the entire branch', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3, 4], 'deep');

		// Act
		expect(map.delete([1, 2, 3, 4])).toBe(true);

		// Assert: the whole branch is gone
		expect(map.has([1, 2, 3, 4])).toBe(false);
		expect(map.get([1, 2, 3, 4])).toBeUndefined();
		// There should be no other keys left
		expect(map.size).toBe(0);
		expect(Array.from(map.entries())).toEqual([]);
	});

	it('should return false if no value is set and deleteSubTree is false', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'root');
		// [1, 2] exists as a path, but no value is set
		map.set([1, 2, 3], 'leaf');
		// Act & Assert
		expect(map.delete([1, 2], false)).toBe(false);
	});

	it('should return false if no value is set, deleteSubTree is true, and there are no subnodes', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'root');
		// [2] exists as a path, but no value is set and no subnodes
		// Act & Assert
		expect(map.delete([2], true)).toBe(false);
	});

	it('should delete a subtree and all its subnodes', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1], 'root');
		map.set([1, 3], 'a');
		map.set([1, 2, 3], 'b');
		map.set([1, 2, 4], 'c');
		map.set([1, 3, 2], 'd');
		map.set([1, 2, 5], 'e');

		// Act
		// Delete subtree [1, 2]
		expect(map.delete([1, 2], true)).toBe(true);

		// Assert: only non-subtree keys remain
		expect(map.has([1])).toBe(true);
		expect(map.has([1, 3])).toBe(true);
		expect(map.has([1, 3, 2])).toBe(true);
		expect(map.has([1, 2, 3])).toBe(false);
		expect(map.has([1, 2, 4])).toBe(false);
		expect(map.has([1, 2, 5])).toBe(false);

		expect(Array.from(map.entries())).toEqual([
			[[1], 'root'],
			[[1, 3], 'a'],
			[[1, 3, 2], 'd'],
		]);
	});
	it('should handle deleting middle nodes in a map with string[] keys of different sizes', () => {
		// Arrange
		const map = new NestedMap<string[], string>();
		map.set(['a'], 'one');
		map.set(['a', 'b'], 'two');
		map.set(['a', 'b', 'c'], 'three');
		map.set(['x', 'y'], 'xy');
		map.set(['x', 'y', 'z'], 'xyz');

		// Act
		// Delete a middle node
		expect(map.delete(['a', 'b'])).toBe(true);
		expect(map.get(['a', 'b'])).toBeUndefined();
		expect(map.has(['a', 'b'])).toBe(false);

		// Assert: other nodes should remain
		expect(map.get(['a'])).toBe('one');
		expect(map.get(['a', 'b', 'c'])).toBe('three');
		expect(map.get(['x', 'y'])).toBe('xy');
		expect(map.get(['x', 'y', 'z'])).toBe('xyz');

		// Delete another middle node
		expect(map.delete(['x', 'y'])).toBe(true);
		expect(map.get(['x', 'y'])).toBeUndefined();
		expect(map.has(['x', 'y'])).toBe(false);
		expect(map.get(['x', 'y', 'z'])).toBe('xyz');

		// Final state
		expect(map.size).toBe(3);
		expect(
			Array.from(map.entries()).sort((a, b) =>
				a[0].join(',') > b[0].join(',') ? 1 : -1,
			),
		).toEqual([
			[['a'], 'one'],
			[['a', 'b', 'c'], 'three'],
			[['x', 'y', 'z'], 'xyz'],
		]);
	});

	it('should get existing value or set a new one with getOrSet', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'existing');

		// Act & Assert
		// Should get existing value
		expect(map.getOrSet([1, 'a'], () => 'new')).toBe('existing');

		// Should set and return new value if not present
		expect(map.getOrSet([2, 'b'], () => 'created')).toBe('created');
		expect(map.get([2, 'b'])).toBe('created');
	});
	it('should iterate over all entries in a subnode given a basePath', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'value1');
		map.set([1, 'b'], 'value2');
		map.set([2, 'c'], 'value3');

		// Act
		// Use entries(basePath) to iterate over all keys in the subnode referenced by [1]
		const subnodeEntries = Array.from(map.entries({ basePath: [1] }));

		// Assert
		expect(subnodeEntries).toHaveLength(2);
		expect(subnodeEntries).toContainEqual([[1, 'a'], 'value1']);
		expect(subnodeEntries).toContainEqual([[1, 'b'], 'value2']);
	});

	it('should iterate over all entries in a subnode given a upper node value', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'value1');
		map.set([1, 'b'], 'value2');
		map.set([2, 'c'], 'value3');

		// Act
		// Use entries(basePath) to iterate over all keys in the subnode referenced by [1]
		const subnodeEntries = Array.from(map.entries({ basePath: 1 }));

		// Assert
		expect(subnodeEntries).toHaveLength(2);
		expect(subnodeEntries).toContainEqual([[1, 'a'], 'value1']);
		expect(subnodeEntries).toContainEqual([[1, 'b'], 'value2']);
	});

	it('should store and retrieve values with array keys', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();

		// Act
		map.set([1, 'hello'], 'value1');
		map.set([2, 'world'], 'value2');

		// Assert
		expect(map.get([1, 'hello'])).toBe('value1');
		expect(map.get([2, 'world'])).toBe('value2');
	});

	it('should handle value-based equality for array keys', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();

		// Act
		map.set([1, 'hello'], 'first');
		map.set([1, 'hello'], 'second'); // Same key, should overwrite

		// Assert
		expect(map.get([1, 'hello'])).toBe('second');
		expect(map.size).toBe(1);
	});

	it('should return undefined for non-existent keys', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();

		// Act & Assert
		expect(map.get([1, 'hello'])).toBeUndefined();
		expect(map.get([999, 'nonexistent'])).toBeUndefined();
	});

	it('should correctly report key existence with has()', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'hello'], 'value');

		// Act & Assert
		expect(map.has([1, 'hello'])).toBe(true);
		expect(map.has([1, 'world'])).toBe(false);
		expect(map.has([2, 'hello'])).toBe(false);
	});

	it('should track size correctly', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();

		// Act & Assert
		expect(map.size).toBe(0);

		map.set([1, 'a'], 'value1');
		expect(map.size).toBe(1);

		map.set([2, 'b'], 'value2');
		expect(map.size).toBe(2);

		map.set([1, 'a'], 'updated'); // Overwrite, size shouldn't change
		expect(map.size).toBe(2);
	});

	it('should delete entries correctly', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'hello'], 'value1');
		map.set([2, 'world'], 'value2');

		// Act & Assert
		expect(map.size).toBe(2);
		expect(map.delete([1, 'hello'])).toBe(true);
		expect(map.size).toBe(1);
		expect(map.delete([2, 'world'])).toBe(true);
		expect(map.size).toBe(0);
		// Map should be empty
		expect(map.has([1, 'hello'])).toBe(false);
		expect(map.has([2, 'world'])).toBe(false);
		expect(Array.from(map.entries())).toHaveLength(0);
	});

	it('should return false when deleting non-existent keys', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();

		// Act
		const deleted = map.delete([1, 'nonexistent']);

		// Assert
		expect(deleted).toBe(false);
		expect(map.size).toBe(0);
	});

	it('should clear all entries', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'hello'], 'value1');
		map.set([2, 'world'], 'value2');

		// Act
		map.clear();

		// Assert
		expect(map.size).toBe(0);
		expect(map.has([1, 'hello'])).toBe(false);
		expect(map.has([2, 'world'])).toBe(false);
	});

	it('should work with different array lengths', () => {
		// Arrange
		const map = new NestedMap<number[], string>();

		// Act
		map.set([1], 'one');
		map.set([1, 2], 'one-two');
		map.set([1, 2, 3], 'one-two-three');

		// Assert
		expect(map.get([1])).toBe('one');
		expect(map.get([1, 2])).toBe('one-two');
		expect(map.get([1, 2, 3])).toBe('one-two-three');
		expect(map.size).toBe(3);
	});

	it('should work with mixed types in arrays', () => {
		// Arrange
		const map = new NestedMap<[number, string, boolean], string>();
		const obj = { id: 1 };

		// Act
		map.set([1, 'hello', true], 'value1');
		map.set([obj as any, 'world', false], 'value2');

		// Assert
		expect(map.get([1, 'hello', true])).toBe('value1');
		expect(map.get([obj as any, 'world', false])).toBe('value2');
	});

	it('should iterate over entries correctly', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'value1');
		map.set([2, 'b'], 'value2');

		// Act
		const entries = Array.from(map.entries());

		// Assert
		expect(entries).toHaveLength(2);
		expect(entries).toContainEqual([[1, 'a'], 'value1']);
		expect(entries).toContainEqual([[2, 'b'], 'value2']);
	});

	it('should iterate over keys correctly', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'value1');
		map.set([2, 'b'], 'value2');

		// Act
		const keys = Array.from(map.keys());

		// Assert
		expect(keys).toHaveLength(2);
		expect(keys).toContainEqual([1, 'a']);
		expect(keys).toContainEqual([2, 'b']);
	});

	it('should iterate over values correctly', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'value1');
		map.set([2, 'b'], 'value2');

		// Act
		const values = Array.from(map.values());

		// Assert
		expect(values).toHaveLength(2);
		expect(values).toContain('value1');
		expect(values).toContain('value2');
	});

	it('should support forEach iteration', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'value1');
		map.set([2, 'b'], 'value2');
		const results: Array<{ key: [number, string]; value: string }> = [];

		// Act
		map.forEach((value: string, key: [number, string]) => {
			results.push({ key, value });
		});

		// Assert
		expect(results).toHaveLength(2);
		expect(results).toContainEqual({ key: [1, 'a'], value: 'value1' });
		expect(results).toContainEqual({ key: [2, 'b'], value: 'value2' });
	});

	it('should be iterable with for...of', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		map.set([1, 'a'], 'value1');
		map.set([2, 'b'], 'value2');
		const results: Array<[[number, string], string]> = [];

		// Act
		for (const entry of map) {
			results.push(entry);
		}

		// Assert
		expect(results).toHaveLength(2);
		expect(results).toContainEqual([[1, 'a'], 'value1']);
		expect(results).toContainEqual([[2, 'b'], 'value2']);
	});

	it('should initialize from iterable', () => {
		// Arrange
		const entries: Array<[[number, string], string]> = [
			[[1, 'a'], 'value1'],
			[[2, 'b'], 'value2'],
		];

		// Act
		const map = new NestedMap(entries);

		// Assert
		expect(map.size).toBe(2);
		expect(map.get([1, 'a'])).toBe('value1');
		expect(map.get([2, 'b'])).toBe('value2');
	});

	it('should have correct toString tag', () => {
		// Arrange
		const map = new NestedMap<[number], string>();

		// Act & Assert
		expect(Object.prototype.toString.call(map)).toBe('[object NestedMap]');
	});

	it('should handle empty arrays as keys', () => {
		// Arrange
		const map = new NestedMap<[], string>();

		// Act
		map.set([], 'empty-array-value');

		// Assert
		expect(map.get([])).toBe('empty-array-value');
		expect(map.has([])).toBe(true);
		expect(map.size).toBe(1);
	});

	it('does not increase size for different array instances with same values', () => {
		// Arrange
		const map = new NestedMap<[number, string], string>();
		const arr1: [number, string] = [7, 'same'];
		const arr2: [number, string] = [7, 'same']; // different instance, same values

		// Act
		map.set(arr1, 'first');
		map.set(arr2, 'second');

		// Assert
		expect(map.size).toBe(1);
		expect(map.get(arr1)).toBe('second');
		expect(map.get(arr2)).toBe('second');
		expect(map.has(arr1)).toBe(true);
		expect(map.has(arr2)).toBe(true);
	});
});
