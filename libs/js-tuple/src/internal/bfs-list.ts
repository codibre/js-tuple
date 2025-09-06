// A queue implementation for DFS-like traversal, but with queue semantics
// push adds to the end, pop removes from the front
interface Node<T> {
	value: T;
	next?: Node<T>;
}

export class BfsList<T> {
	private head?: Node<T>;
	private tail?: Node<T>;
	private _length = 0;

	constructor(initial: T) {
		this.push(initial);
	}

	push(item: T): void {
		const node: Node<T> = { value: item };
		if (!this.tail) {
			this.head = this.tail = node;
		} else {
			this.tail.next = node;
			this.tail = node;
		}
		this._length++;
	}

	pop(): T | undefined {
		if (!this.head) return undefined;
		const value = this.head.value;
		this.head = this.head.next;
		if (!this.head) this.tail = undefined;
		this._length--;
		return value;
	}

	get length(): number {
		return this._length;
	}
}
