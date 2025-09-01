import { NestedSet } from '../src/nested-set';

describe('NestedSet', () => {
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
});
