# Advanced Usage: `NestedMap.entries`

## Overview
`NestedMap.entries` provides powerful and flexible iteration over nested keys and values. It supports multiple traversal modes and orderings, making it suitable for advanced tree and graph algorithms.

## Traversal Modes
- **Depth-First (DFS):** Explores as deep as possible before backtracking. Use for recursive-like traversals.
- **Breadth-First (BFS):** Explores all nodes at the current level before moving deeper. Use for shortest-path or level-order traversals.

## Yield Modes
- **Pre-Order:** Yields a node before its children. Typical for copying or serializing trees.
- **Post-Order:** Yields a node after all its children. Useful for cleanup, deletion, or dependency resolution.

## API Example
```typescript
for (const [key, value] of map.entries({
  traverseMode: TraverseMode.DepthFirst, // or BreadthFirst
  yieldMode: YieldMode.PreOrder,         // or PostOrder
})) {
  // key: array representing the path
  // value: stored value
}
```

## Particularities
- **Flexible Key Paths:** Keys are always arrays, representing the full path in the nested structure.
- **Partial Traversal:** You can start traversal from any subpath using `basePath`.
- **Custom Traversal:** Combine `traverseMode` and `yieldMode` for custom iteration order.
- **Performance:**
  - DFS uses a stack (LIFO), BFS uses a queue (FIFO).
  - BFS post-order requires temporary storage (O(N) memory) to yield nodes in reverse.
  - DFS post-order is naturally recursive and memory-efficient.
- **Edge Cases:**
  - If a node has no value but has children, only children are yielded.
  - If `basePath` does not exist, iteration yields nothing.

## Advanced Patterns
- **Subtree Traversal:**
  ```typescript
  for (const [key, value] of map.entries({ basePath: [1, 2] })) {
    // Traverse only the subtree rooted at [1, 2]
  }
  ```
- **Post-Order Cleanup:**
  ```typescript
  for (const [key, value] of map.entries({ yieldMode: YieldMode.PostOrder })) {
    // Safely delete or process children before parents
  }
  ```
- **Level-Order Processing:**
  ```typescript
  for (const [key, value] of map.entries({ traverseMode: TraverseMode.BreadthFirst })) {
    // Process nodes level by level
  }
  ```

## Summary
`NestedMap.entries` is highly customizable for advanced iteration needs. Choose traversal and yield modes based on your algorithm requirements, and be aware of memory/performance tradeoffs for post-order BFS.
