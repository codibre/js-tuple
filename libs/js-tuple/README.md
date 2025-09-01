# js-tuple

A high-performance JavaScript library for creating immutable, cached tuples that can be safely used as Map keys.

## Why js-tuple?

In JavaScript, arrays are compared by reference, not by value. This means `[1, 2, 3] !== [1, 2, 3]`, which makes arrays unsuitable as Map keys when you want value-based equality. **js-tuple** solves this by providing cached, immutable arrays where identical element sequences always return the same reference.

## Installation

```bash
npm install js-tuple
```

## Quick Start

```typescript
import { tuple, NestedMap, NestedSet } from 'js-tuple';

// Same elements = same reference
const t1 = tuple([1, 2, 3]);
const t2 = tuple([1, 2, 3]);
console.log(t1 === t2); // true ✅

// Perfect for Map keys
const cache = new Map();
cache.set(tuple(['user', 123]), { name: 'John' });
cache.set(tuple(['post', 456]), { title: 'Hello' });

// Retrieve values using the same tuple
console.log(cache.get(tuple(['user', 123]))); // { name: 'John' } ✅

// NestedMap: value-based equality for array keys
const map = new NestedMap<[number, string], string>();
map.set([1, 'a'], 'foo');
map.set([1, 'a'], 'bar'); // Overwrites previous value
map.set([2, 'b'], 'baz');
console.log(map.get([1, 'a'])); // 'bar'
console.log(map.size); // 2

// NestedSet: value-based equality for array keys
const set = new NestedSet<[number, string]>();
set.add([1, 'a']);
set.add([1, 'a']); // No duplicate
set.add([2, 'b']);
console.log(set.has([1, 'a'])); // true
console.log(set.size); // 2
```

## Features

- **🔒 Immutable**: All returned tuples are frozen and cannot be modified
- **⚡ High Performance**: Optimized tree-based caching outperforms string serialization
- **🧠 Memory Efficient**: Uses WeakRefs and WeakMaps for automatic garbage collection
- **🎯 Type Safe**: Full TypeScript support with proper type inference
- **🔄 Reference Equality**: Same elements always return the same instance
- **🗑️ Auto Cleanup**: Unused tuples are automatically garbage collected

## Performance

Latest Benchmark Results:

| Method                        | Creation + Map Set         | Map Lookup                |
|-------------------------------|----------------------------|---------------------------|
| **Tuple - Create key + Map set**      | **387,744 ops/sec** ±7.50%   | 663,001 ops/sec ±3.63%    |
| JSON.stringify                | 249,158 ops/sec ±4.52%     | 266,379 ops/sec ±5.91%    |
| JSON.stringify + MD5          | 31,382 ops/sec ±9.86%      | 33,023 ops/sec ±9.35%     |
| Manual stringify              | 292,862 ops/sec ±4.57%     | 255,357 ops/sec ±9.05%    |
| Manual stringify + MD5        | 33,865 ops/sec ±6.32%      | 31,228 ops/sec ±12.22%    |
| **Nested Map - Direct array** | 318,488 ops/sec ±4.09%     | **1,450,924 ops/sec** ±4.27% |

**Fastest for creation + insertion:** Tuple - Create key + Map set
**Fastest for lookup:** Nested Map - Direct array lookup

Both tuple and nested strategies are much faster than any stringification approach.

## API Reference

### `tuple<T>(elements: T): Readonly<T>`

Creates a cached, immutable tuple from an array of elements.

**Parameters:**
- `elements`: Array of elements to create a tuple from

**Returns:**
- Frozen array instance that maintains reference equality for identical element sequences

**Example:**
```typescript
const coordinates = tuple([10, 20]);
const sameCoordinates = tuple([10, 20]);
console.log(coordinates === sameCoordinates); // true
```

### `getRef(value: unknown): Reference`

Gets an object reference for any value, enabling it to be used as a WeakMap key. This is primarily used internally but exported for advanced use cases.

**Parameters:**
- `value`: Any value to get a reference for

**Returns:**
- Object that can be used as a WeakMap key

## Usage Examples

### Map Keys

```typescript
import { tuple } from 'js-tuple';

const userCache = new Map();

// Store data using tuple keys
userCache.set(tuple(['user', 'profile', 123]), { name: 'Alice' });
userCache.set(tuple(['user', 'settings', 123]), { theme: 'dark' });

// Retrieve data using the same tuple structure
const profile = userCache.get(tuple(['user', 'profile', 123]));
console.log(profile); // { name: 'Alice' }
```

### Memoization

```typescript
import { tuple } from 'js-tuple';

const memoCache = new Map();

function expensiveFunction(a: number, b: string, c: object) {
  const key = tuple([a, b, c]);

  if (memoCache.has(key)) {
    return memoCache.get(key);
  }

  const result = /* expensive computation */;
  memoCache.set(key, result);
  return result;
}
```

### Set Operations

```typescript
import { tuple } from 'js-tuple';

const coordinates = new Set();

coordinates.add(tuple([0, 0]));
coordinates.add(tuple([1, 1]));
coordinates.add(tuple([0, 0])); // Won't add duplicate

console.log(coordinates.size); // 2
console.log(coordinates.has(tuple([0, 0]))); // true
```

### React State Keys

```typescript
import { tuple } from 'js-tuple';
import { useMemo } from 'react';

function useQuery(endpoint: string, params: object) {
  const queryKey = tuple([endpoint, params]);

  return useMemo(() => {
    return fetchData(endpoint, params);
  }, [queryKey]); // Stable reference for same endpoint + params
}
```

## Mixed Types Support

tuple works with any combination of primitive values and objects:

```typescript
const obj = { id: 1 };
const symbol = Symbol('test');

const mixed1 = tuple([1, 'hello', obj, symbol, null]);
const mixed2 = tuple([1, 'hello', obj, symbol, null]);

console.log(mixed1 === mixed2); // true - same references
```

## Memory Management

tuple uses advanced memory management techniques:

- **WeakRefs**: Tuples can be garbage collected when no longer referenced
- **WeakMaps**: Cache structure doesn't prevent garbage collection of objects
- **Automatic Cleanup**: Primitive wrapper objects are cleaned up automatically
- **No Memory Leaks**: Designed to work safely in long-running applications

```typescript
// Tuples are eligible for GC when no longer referenced
let temp = tuple([1, 2, 3]);
temp = null; // Tuple can now be garbage collected
```

## TypeScript Support

Full TypeScript support with proper type inference:

```typescript
// Type is inferred as Readonly<[number, string, boolean]>
const typed = tuple([42, 'hello', true] as const);

// Works with generic functions
function createKey<T extends readonly unknown[]>(elements: T): Readonly<T> {
  return tuple(elements);
}
```

## Limitations

- **Primitive Caching**: Wrapper objects for primitives are cached with strong references (may accumulate memory usage in very dynamic scenarios)
- **Object Identity**: Objects are compared by reference, not deep equality
- **Modern Environments**: Requires WeakRef and FinalizationRegistry support (Node.js 14.6+, modern browsers)

## Browser Support

- **Node.js**: 14.6.0+
- **Chrome**: 84+
- **Firefox**: 79+
- **Safari**: 14.1+
- **Edge**: 84+

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details.

## Which Should I Use?

### NestedMap & NestedSet

- **Value-based equality**: Arrays with the same values are treated as the same key, even if they are different instances.
- **Deep key support**: Works for any array of values, including objects and primitives.
- **Convenient API**: No need to call a tuple function, just use arrays directly.
- **Much faster for reading**: Lookup performance is significantly better than tuple-based Map/Set.
- **Best for general usage**: Since reads are usually more common than writes, NestedMap & NestedSet are recommended for most use cases.

### Map/Set + tuple function

- **Fastest for writing**: Tuple-based Map/Set is faster for key creation and insertion.
- **Reference equality**: Only identical element arrays return the same reference, so you must always use the tuple function to create keys.
- **Memory efficient**: Uses WeakRefs and WeakMaps for automatic cleanup.
- **Best for read reading scenarios**: When writing is way common than reading, or when you just can't use NestedMap/NestedSet

#### Example

```typescript
import { tuple } from 'js-tuple';

const cache = new Map();
cache.set(tuple([1, 'a']), 'foo');
cache.set(tuple([2, 'b']), 'bar');
console.log(cache.get(tuple([1, 'a']))); // 'foo'
```

## Summary

- Both **NestedMap/NestedSet** and **Map/Set + tuple** are much better than key stringification for both writing and reading.
- For most applications, **NestedMap & NestedSet** are recommended, as lookup/read performance is much higher and reads are typically more frequent.
- Use **Map/Set + tuple** if you need the absolute fastest key creation and you control all key generation.
