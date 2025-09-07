import { NestedMap } from '../src/nested-map';

describe('NestedMap.clone', () => {
	it('should create a deep clone with identical structure and values', () => {
		// Arrange
		const map = new NestedMap<number[], any>();
		map.set([1, 2, 3], { a: 1 });
		map.set([1, 2, 4], 'b');
		map.set([1, 2, 5], [1, 2, 3]);
		map.set([1, 9, 9], 'd');

		// Act
		const clone = map.clone();

		// Assert
		expect([...clone.entries()]).toEqual([...map.entries()]);
		expect(clone.size).toBe(map.size);
		// Changing clone does not affect original
		clone.set([1, 2, 3], { a: 2 });
		expect(map.get([1, 2, 3])).toEqual({ a: 1 });
		expect(clone.get([1, 2, 3])).toEqual({ a: 2 });
	});

	it('should clone only a subtree when basePath is provided', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');
		map.set([1, 2, 4], 'b');
		map.set([1, 2, 5], 'c');
		map.set([1, 9, 9], 'd');

		// Act
		const subClone = map.clone([1, 2]);

		// Assert
		expect([...subClone.entries()]).toEqual(
			expect.arrayContaining([
				[[3], 'a'],
				[[4], 'b'],
				[[5], 'c'],
			]),
		);
		expect(subClone.size).toBe(3);
		// Changing subClone does not affect original
		subClone.set([3], 'z');
		expect(map.get([1, 2, 3])).toBe('a');
		expect(subClone.get([3])).toBe('z');
	});

	it('should return an empty map if basePath does not exist', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');

		// Act
		const subClone = map.clone([9, 9]);

		// Assert
		expect(subClone.size).toBe(0);
		expect([...subClone.entries()]).toEqual([]);
	});
});
