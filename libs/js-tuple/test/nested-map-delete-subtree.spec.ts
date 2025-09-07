import { NestedMap } from '../src/nested-map';

describe('NestedMap.delete with deleteSubTree', () => {
	it('should decrement size by the number of subnodes when deleting a subtree', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');
		map.set([1, 2, 4], 'b');
		map.set([1, 2, 5], 'c');
		expect(map.size).toBe(3);

		// Act
		const deleted = map.delete([1, 2], true);

		// Assert
		expect(deleted).toBe(true);
		expect(map.size).toBe(0);
		expect(map.has([1, 2, 3])).toBe(false);
		expect(map.has([1, 2, 4])).toBe(false);
		expect(map.has([1, 2, 5])).toBe(false);
	});
	it('should decrement size by the number of subnodes plus parent when parent also has a value', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2], 'parent');
		map.set([1, 2, 3], 'a');
		map.set([1, 2, 4], 'b');
		map.set([1, 2, 5], 'c');
		expect(map.size).toBe(4);

		// Act
		const deleted = map.delete([1, 2], true);

		// Assert
		expect(deleted).toBe(true);
		expect(map.size).toBe(0);
		expect(map.has([1, 2])).toBe(false);
		expect(map.has([1, 2, 3])).toBe(false);
		expect(map.has([1, 2, 4])).toBe(false);
		expect(map.has([1, 2, 5])).toBe(false);
	});
});
