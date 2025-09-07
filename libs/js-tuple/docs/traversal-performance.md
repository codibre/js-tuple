# Traversal Performance in js-tuple and Other Tree Libraries

## Choosing the Most Efficient Traversal

When working with tree-like data structures, traversal performance can vary significantly depending on the method and library used. In `js-tuple`'s `NestedMap`, the most performant traversal option is the `values` method. This method only yields values and does **not** keep track of the key path, making it the fastest and most memory-efficient choice. **Always prefer `values` when you do not need the key path.**

If you require the key path for each value, use the `entries` method. While `entries` is still efficient, it incurs additional overhead to construct and yield the key path for each entry. Use it only when strictly necessary.

## Traversal Insights

Choosing the right traversal mode depends on your use case and the shape of your data:

- **DFS Pre-Order**: Best for visiting nodes as soon as they are discovered. Use for tasks like copying, serialization, or searching for a specific value. Memory usage is low and scales with tree depth.

- **DFS Post-Order**: Ideal for operations that require processing children before parents, such as deleting or freeing resources. Also memory-efficient, scaling with tree depth.

- **BFS Pre-Order**: Useful for level-order processing, such as finding the shortest path or working with breadth-based algorithms. Memory usage scales with the width of the tree (number of nodes at the widest level), but is generally manageable for most trees.

- **BFS Post-Order**: Rarely needed in practice. It requires storing all levels in memory before yielding results, leading to high memory consumption for large or wide trees. Avoid this mode unless you have a specific need for bottom-up, level-wise processing.

**General Guidance:**
- Prefer DFS traversals for deep trees and when memory is a concern.
- Use BFS Pre-Order for algorithms that require level-wise access, but be cautious with very wide trees.
- Avoid BFS Post-Order for large or wide trees, as it can consume significant memory and impact performance.

## Benchmark Results

Below are the results of benchmarks comparing `js-tuple NestedMap` with other popular tree libraries (`tree-model`, `bintrees RBTree`, `js-tree`) across different traversal modes and tree sizes. Each table shows the operations per second (ops/sec) and error margin (±%) for each library and tree size. Failures are indicated with the reason.

### DFS Pre-Order

| Library              | 100 nodes                | 500 nodes                | 1000 nodes               | 2000 nodes               | 5000 nodes               |
|---------------------|-------------------------|-------------------------|-------------------------|-------------------------|-------------------------|
| js-tuple NestedMap  | **196,732 ±0.70%**      | **28,600 ±5.63%**       | **11,487 ±4.88%**       | **5,158 ±5.09%**        | **1,430 ±6.44%**        |
| tree-model          | 149,317 ±8.77%          | 23,521 ±5.26%           | 9,768 ±6.34%            | 4,371 ±6.52%            | **1,550 ±6.45%**        |
| bintrees RBTree     | 130,453 ±8.06%          | 14,811 ±5.08%           | 6,648 ±5.86%            | 2,749 ±5.61%            | 1,128 ±5.14%            |
| js-tree             | 79,663 ±6.43%           | 10,940 ±5.80%           | 4,929 ±6.32%            | 2,546 ±5.18%            | Failed (Stack Overflow) |

### DFS Post-Order

| Library              | 100 nodes                | 500 nodes                | 1000 nodes               | 2000 nodes               | 5000 nodes               |
|---------------------|-------------------------|-------------------------|-------------------------|-------------------------|-------------------------|
| js-tuple NestedMap  | **153,212 ±5.72%**      | **22,350 ±4.67%**       | **10,129 ±6.63%**       | **5,053 ±3.65%**        | 1,274 ±5.30%            |
| tree-model          | 145,119 ±4.92%          | 18,578 ±5.14%           | **9,696 ±6.67%**        | 3,755 ±6.67%            | **1,461 ±6.61%**        |
| bintrees RBTree     | Failed (Node Count)     | Failed (Node Count)     | Failed (Node Count)     | Failed (Node Count)     | Failed (Node Count)     |
| js-tree             | 87,221 ±4.26%           | 10,395 ±7.43%           | 4,790 ±6.89%            | 2,525 ±6.43%            | Failed (Stack Overflow) |

### BFS Pre-Order

| Library              | 100 nodes                | 500 nodes                | 1000 nodes               | 2000 nodes               | 5000 nodes               |
|---------------------|-------------------------|-------------------------|-------------------------|-------------------------|-------------------------|
| js-tuple NestedMap  | **135,164 ±4.75%**      | **22,833 ±5.33%**       | **11,169 ±5.16%**       | **4,577 ±6.32%**        | **1,334 ±5.86%**        |
| tree-model          | 120,425 ±5.86%          | 19,104 ±6.21%           | 9,559 ±5.60%            | **4,397 ±5.46%**        | **1,319 ±5.87%**        |
| bintrees RBTree     | Failed (Not Supported)  | Failed (Not Supported)  | Failed (Not Supported)  | Failed (Not Supported)  | Failed (Not Supported)  |
| js-tree             | 77,796 ±5.06%           | 10,252 ±7.11%           | 5,066 ±6.56%            | 2,547 ±5.80%            | Failed (Stack Overflow) |

### BFS Post-Order

| Library              | 100 nodes                | 500 nodes                | 1000 nodes               | 2000 nodes               | 5000 nodes               |
|---------------------|-------------------------|-------------------------|-------------------------|-------------------------|-------------------------|
| js-tuple NestedMap  | **128,635 ±4.57%**      | **19,808 ±5.38%**       | **9,316 ±5.26%**        | **4,397 ±4.98%**        | **1,327 ±5.78%**        |
| tree-model          | 121,117 ±4.79%          | 12,302 ±3.83%           | 7,056 ±7.32%            | 3,264 ±5.93%            | Failed (Stack Overflow) |
| bintrees RBTree     | Failed (Not Supported)  | Failed (Not Supported)  | Failed (Not Supported)  | Failed (Not Supported)  | Failed (Not Supported)  |
| js-tree             | 72,851 ±4.32%           | 8,728 ±6.31%            | 4,737 ±4.83%            | 1,673 ±5.13%            | Failed (Stack Overflow) |

## Summary

- **Use `values` for best performance**: It avoids key path construction and is the fastest option.
- If you need key paths, `entries` is still efficient but slower than `values`.
- For large trees, some libraries may fail due to stack overflow or unsupported traversal modes.
- `js-tuple NestedMap` and `tree-model` are generally the fastest and most robust options across traversal modes and tree sizes.

For more details on usage and API, see the main documentation.
