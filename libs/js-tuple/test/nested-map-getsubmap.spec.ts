import { TraverseMode } from 'src';
import { NestedMap } from '../src/nested-map';

describe('NestedMap.getSubMap', () => {
	it('should yield only relative keys from subMap traversal', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');
		map.set([1, 2, 4], 'b');
		map.set([1, 2, 5], 'c');
		const subMap = map.getSubMap([1, 2]);

		// Act
		const keys = Array.from(
			subMap.entries({
				traverseMode: TraverseMode.BreadthFirst,
			}),
		).map(([key]) => key);

		// Assert
		expect(keys).toEqual([[3], [4], [5]]);
	});

	it('should reflect changes in the original map when setting via subMap', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');
		const subMap = map.getSubMap([1, 2]);

		// Act
		subMap.set([3], 'updated');

		// Assert
		expect(map.get([1, 2, 3])).toBe('updated');
		expect(map.size).toBe(1);
	});

	it('should reflect changes in the original map when deleting via subMap', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');
		map.set([1, 2, 4], 'b');
		const subMap = map.getSubMap([1, 2]);

		// Act
		subMap.delete([3]);

		// Assert
		expect(map.has([1, 2, 3])).toBe(false);
		expect(map.size).toBe(1);
	});

	it('should update counts correctly when setting and deleting via subMap', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');
		map.set([1, 2, 4], 'b');
		const subMap = map.getSubMap([1, 2]);

		// Act
		subMap.set([5], 'c');
		subMap.delete([3]);

		// Assert
		expect(map.size).toBe(2);
		expect(subMap.size).toBe(2);
		expect(map.has([1, 2, 5])).toBe(true);
		expect(map.has([1, 2, 3])).toBe(false);
	});

	it('should traverse only the submap entries and yield relative keys', () => {
		// Arrange
		const map = new NestedMap<number[], string>();
		map.set([1, 2, 3], 'a');
		map.set([1, 2, 4], 'b');
		map.set([1, 2, 5], 'c');
		map.set([1, 9, 9], 'd');
		const subMap = map.getSubMap([1, 2]);

		// Act
		const entries = Array.from(
			subMap.entries({
				traverseMode: TraverseMode.BreadthFirst,
			}),
		);

		// Assert
		expect(entries.length).toBe(3);
		expect(entries.map(([key]) => key)).toEqual([[3], [4], [5]]);
	});
});
