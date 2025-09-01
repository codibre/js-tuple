import { tuple } from '../src';

describe('tuple', () => {
	it('returns the same instance for the same primitive elements', () => {
		// Arrange
		const arr1 = [1, 2, 3];
		const arr2 = [1, 2, 3];

		// Act
		const t1 = tuple(arr1);
		const t2 = tuple(arr2);

		// Assert
		expect(t1).toBe(t2);
	});

	it('should work with intercalated calls of similar tuples', () => {
		// Arrange
		const arr1 = [1, 2, 3];
		const arr2 = [1, 2, 3, 4];
		const arr3 = [1, 2, 3];

		// Act
		const t1 = tuple(arr1);
		const t2 = tuple(arr2);
		const t3 = tuple(arr3);

		// Assert
		expect(1).not.toBe(t2);
		expect(t1).toBe(t3);
	});

	it('returns the same instance for the same object elements', () => {
		// Arrange
		const obj = { a: 1 };
		const arr1 = [obj, 2] as const;
		const arr2 = [obj, 2] as const;

		// Act
		const t1 = tuple(arr1);
		const t2 = tuple(arr2);

		// Assert
		expect(t1).toBe(t2);
	});

	it('returns different instances for different elements', () => {
		// Arrange
		const arr1 = [1, 2, 3] as const;
		const arr2 = [1, 2, 4] as const;

		// Act
		const t1 = tuple(arr1);
		const t2 = tuple(arr2);

		// Assert
		expect(t1).not.toBe(t2);
	});

	it('returns the same instance for mixed types', () => {
		// Arrange
		const obj = { a: 1 };
		const arr1 = [1, obj, 'x'] as const;
		const arr2 = [1, obj, 'x'] as const;

		// Act
		const t1 = tuple(arr1);
		const t2 = tuple(arr2);

		// Assert
		expect(t1).toBe(t2);
	});

	it('returns the same instance for empty arrays', () => {
		// Arrange
		const arr1: [] = [];
		const arr2: [] = [];

		// Act
		const t1 = tuple(arr1);
		const t2 = tuple(arr2);

		// Assert
		expect(t1).toBe(t2);
	});

	it('returns frozen arrays', () => {
		// Arrange
		const arr = [1, 2, 3] as const;

		// Act
		const t = tuple(arr);

		// Assert
		expect(Object.isFrozen(t)).toBe(true);
	});

	it('returns the same instance for deeply equal objects', () => {
		// Arrange
		const arr1 = [{ a: 1 }, 2] as const;
		const arr2 = [{ a: 1 }, 2] as const;

		// Act
		const t1 = tuple(arr1);
		const t2 = tuple(arr2);

		// Assert
		expect(t1).not.toBe(t2); // different object references
	});
});
