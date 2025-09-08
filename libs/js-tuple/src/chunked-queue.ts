// Optimized FIFO queue using fixed-size array blocks for efficient memory and performance

const BLOCK_SIZE = 1024;

class Block<T> {
	items: T[];
	pushIndex: number = 0;
	popIndex: number = 0;
	next?: Block<T>;

	constructor() {
		this.items = new Array(BLOCK_SIZE);
	}

	isFull() {
		return this.pushIndex >= BLOCK_SIZE;
	}

	isEmpty() {
		return this.popIndex >= this.pushIndex;
	}
}

/**
 * A memory-efficient FIFO queue optimized for high-throughput scenarios.
 * Uses fixed-size array blocks to minimize memory allocations and copying.
 * Suitable for scenarios with frequent enqueue/dequeue operations.
 */
export class ChunkedQueue<T> {
	private head?: Block<T>;
	private tail?: Block<T>;
	private _length = 0;

	constructor(item: T) {
		this.push(item);
	}

	/**
	 * Adds an item to the end of the queue.
	 * @param item The item to add.
	 */
	push(item: T): void {
		if (!this.tail || this.tail.isFull()) {
			const newBlock = new Block<T>();
			if (this.tail) this.tail.next = newBlock;
			this.tail = newBlock;
			if (!this.head) this.head = newBlock;
		}
		this.tail.items[this.tail.pushIndex++] = item;
		this._length++;
	}

	/**
	 * Removes and returns the oldest item of the queue.
	 * @returns The oldest item of the queue, or undefined if the queue is empty.
	 */
	pop(): T | undefined {
		if (!this.head || this.head.isEmpty()) {
			if (!this.head?.next) return undefined;
			this.head = this.head.next;
		}
		const item = this.head.items[this.head.popIndex++];
		this._length--;
		return item;
	}

	/**
	 * Processes and removes all items from the queue.
	 * The callback may add more items to the queue during processing,
	 * But it needs to take care of the logic to avoid infinite loops.
	 * @param cb Callback function to process each item.
	 */
	exhaust(cb: (item: T) => void): void {
		while (this.length) {
			const item = this.pop() as T;
			cb(item);
		}
	}

	/**
	 * The number of items currently in the queue.
	 * @returns The number of items in the queue.
	 */
	get length(): number {
		return this._length;
	}
}
