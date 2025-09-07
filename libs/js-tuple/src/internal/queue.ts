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

export class Queue<T> {
	private head?: Block<T>;
	private tail?: Block<T>;
	private _length = 0;

	constructor(item: T) {
		this.push(item);
	}

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

	pop(): T | undefined {
		if (!this.head || this.head.isEmpty()) {
			if (!this.head?.next) return undefined;
			this.head = this.head.next;
		}
		const item = this.head.items[this.head.popIndex++];
		this._length--;
		return item;
	}

	exhaust(cb: (item: T) => void): void {
		while (this.length) {
			const item = this.pop() as T;
			cb(item);
		}
	}

	get length(): number {
		return this._length;
	}
}
