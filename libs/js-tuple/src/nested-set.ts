import { NestedMap } from './nested-map';

export interface NestedSet<K> extends Set<K> {}
export class NestedSet<K> implements Set<K> {
	private readonly _map = new NestedMap<K, 1>();

	add(value: K): this {
		this._map.set(value, 1);
		return this;
	}
	clear(): void {
		this._map.clear();
	}
	delete(value: K): boolean {
		return this._map.delete(value);
	}
	forEach(
		callbackfn: (value: K, value2: K, set: Set<K>) => void,
		thisArg?: unknown,
	): void {
		thisArg ??= this;
		this._map.forEach.call(thisArg, (v, k) => callbackfn(k, k, this), thisArg);
	}
	has(value: K): boolean {
		return this._map.has(value);
	}

	get size(): number {
		return this._map.size;
	}

	*entries(): SetIterator<[K, K]> {
		for (const key of this._map.keys()) {
			yield [key, key];
		}
	}

	keys(): SetIterator<K> {
		return this._map.keys();
	}

	values(): SetIterator<K> {
		return this._map.keys();
	}

	[Symbol.iterator](): SetIterator<K> {
		return this._map.keys();
	}

	get [Symbol.toStringTag](): string {
		return 'NestedSet';
	}
}
