import { NestedMap } from '../src';

describe('NestedMap', () => {
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

		// Act
		const deleted = map.delete([1, 'hello']);

		// Assert
		expect(deleted).toBe(true);
		expect(map.has([1, 'hello'])).toBe(false);
		expect(map.get([1, 'hello'])).toBeUndefined();
		expect(map.size).toBe(1);
		expect(map.has([2, 'world'])).toBe(true);
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
