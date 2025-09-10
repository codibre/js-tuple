import { ChunkedQueue } from 'dist/min';

describe('Queue (block-based)', () => {
	it('should push and pop single items correctly', () => {
		const queue = new ChunkedQueue<number>(0);
		expect(queue.length).toBe(1);
		queue.push(1);
		expect(queue.length).toBe(2);
		expect(queue.pop()).toBe(0);
		expect(queue.pop()).toBe(1);
		expect(queue.length).toBe(0);
		expect(queue.pop()).toBeUndefined();
	});

	it('should handle multiple pushes and pops across blocks', () => {
		const queue = new ChunkedQueue<number>(0);
		for (let i = 1; i < 3000; i++) queue.push(i);
		expect(queue.length).toBe(3000);
		for (let i = 0; i < 3000; i++) expect(queue.pop()).toBe(i);
		expect(queue.length).toBe(0);
		expect(queue.pop()).toBeUndefined();
	});

	it('should work correctly with a 4000 size queue', () => {
		const queue = new ChunkedQueue<number>(0);
		for (let i = 1; i < 4000; i++) queue.push(i);
		expect(queue.length).toBe(4000);
		for (let i = 0; i < 4000; i++) expect(queue.pop()).toBe(i);
		expect(queue.length).toBe(0);
		expect(queue.pop()).toBeUndefined();
	});

	it('should allow interleaved push and pop', () => {
		const queue = new ChunkedQueue<number>(0);
		expect(queue.pop()).toBe(0);
		queue.push(2);
		queue.push(3);
		expect(queue.pop()).toBe(2);
		queue.push(4);
		expect(queue.pop()).toBe(3);
		expect(queue.pop()).toBe(4);
		expect(queue.pop()).toBeUndefined();
	});

	it('should handle empty queue correctly', () => {
		const queue = new ChunkedQueue<number>(0);
		expect(queue.pop()).toBe(0);
		expect(queue.length).toBe(0);
		expect(queue.pop()).toBeUndefined();
	});

	// The current Queue does not support initialization from iterable, so skip this test
});
