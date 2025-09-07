


# Advanced Example: Methods to Obtain Subtrees in NestedMap

`NestedMap` provides two powerful methods for working with subtrees: `getSubMap` and `clone`.

- **`getSubMap`** creates a live, synchronized view into a subtree, allowing you to operate directly on a branch of the original map. Changes made through a submap are immediately reflected in the parent map, making it ideal for scoped operations, modular code, and UI components that need to interact with a specific branch.

- **`clone`** creates a deep, independent copy of the entire map or a subtree. The cloned map is a snapshot: changes to the clone do not affect the original, and vice versa. This is useful for backups, branching, experimentation, or any scenario where you need a safe copy of your data structure.
> **Note:** The `clone` method copies the tree structure and all keys, but does not deep clone the values themselves. If your values are objects or arrays, both the original and the clone will reference the same value objects. For true deep value cloning, you must clone values manually or use a deep clone utility.

Both methods enable focused manipulation of nested data, but with different synchronization and independence properties. The following sections explain their usage, differences, and practical scenarios for each.


## What is `getSubMap`?
`getSubMap(basePath)` returns a new `NestedMap` instance that operates on the subtree rooted at `basePath`. All changes (set, delete) made through the submap are reflected in the original map, and vice versa. Traversal from the submap yields keys relative to the base path.


## What is `clone`?
The `clone` method creates a deep copy of the entire map or a subtree (if a base path is provided). The cloned map is completely independent: changes to the clone do not affect the original, and vice versa. Traversal from the clone yields keys in the same order as the original.

## Example Usage

```typescript
import { NestedMap } from 'js-tuple';

const map = new NestedMap<number[], string>();
map.set([1, 2, 3], 'a');
map.set([1, 2, 4], 'b');
map.set([1, 2, 5], 'c');
map.set([1, 9, 9], 'd');

// Create a submap rooted at [1, 2]
const subMap = map.getSubMap([1, 2]);

// Traversal yields relative keys:
for (const [key, value] of subMap.entries()) {
  // key: [3], [4], [5]
  // value: 'a', 'b', 'c'
}

// Setting via subMap updates the original map
subMap.set([6], 'e');
console.log(map.get([1, 2, 6])); // 'e'

// Deleting via subMap updates the original map
subMap.delete([3]);
console.log(map.has([1, 2, 3])); // false


// Traversal in subMap is scoped to its subtree
console.log([...subMap.entries()]); // [ [ [4], 'b' ], [ [5], 'c' ], [ [6], 'e' ] ]

// Clone the entire map
const clone = map.clone();
console.log([...clone.entries()]); // [ [ [1, 2, 4], 'b' ], [ [1, 2, 5], 'c' ], ... ]

// Clone a subtree
const subClone = map.clone([1, 2]);
console.log([...subClone.entries()]); // [ [ [3], 'a' ], [ [4], 'b' ], [ [5], 'c' ] ]

// Changes to clone do not affect the original
subClone.set([3], 'z');
console.log(map.get([1, 2, 3])); // 'a'
console.log(subClone.get([3])); // 'z'
```


## When to Use `getSubMap` vs. `clone`

| Feature                | getSubMap                      | clone                         |
|------------------------|--------------------------------|-------------------------------|
| Synchronization        | Changes affect original        | Changes are independent       |
| Traversal keys         | Relative to base path          | Relative to base path         |
| Use case               | Scoped, live view              | Snapshot, backup, branching   |
| Memory usage           | Lightweight (view)             | Full copy (higher memory)     |
| Bulk operations        | Directly on original           | On a copy                     |

**Use `getSubMap` when:**
- You want a live, synchronized view into a subtree.
- You need to update or traverse a branch and reflect changes in the original map.
- You want to pass a scoped view to a function or component.
- You'll not update the tree (as clone will use more memory).

**Use `clone` when:**
- You need a snapshot or backup of the map or a subtree.
- You want to branch, experiment, or perform bulk operations without affecting the original.
- You need to serialize, persist, or transfer a copy of the data.

- **Scoped Operations:**
  - When you want to work with a specific branch of a large nested map without affecting or traversing unrelated branches.
- **Modular Code:**
  - Pass submaps to functions or modules that only need access to a subtree, improving encapsulation and reducing complexity.
- **Efficient Bulk Updates:**
  - Apply bulk changes, deletions, or traversals to a subtree without manually handling the full key paths.
- **UI/UX Scenarios:**
  - In tree-based UIs, bind a submap to a component representing a subtree, allowing local edits and traversal.
- **Multi-tenant Data:**
  - Partition data by tenant/user/project, and operate on each partition via submaps for isolation and clarity.



## Notes
- Traversal from a submap yields keys relative to the base path.
- Traversal from a clone yields keys in the same order as the original.
- All changes in submaps are synchronized with the original map.
- Clones are independent and do not affect the original.
- Submaps are lightweight views, not copies.
- Clones are full copies and use more memory.
- **Clone copies the tree structure and keys, but does not deep clone values.** If your values are objects, both maps will reference the same objects unless you clone them separately.

---
For more advanced usage, see other examples in this documentation.
