// Benchmark: DFS and BFS Pre-Order Traversal Comparison
// Compares js-tuple NestedMap, tree-model, bintrees, js-tree, binary-search-tree

const Benchmark = require('benchmark');
const TreeModel = require('tree-model');
const { RBTree } = require('bintrees');
const JSTree = require('js-tree');
const { NestedMap, TraverseMode, YieldMode } = require('../dist/min');

const SIZES = [100, 500, 1000, 2000, 5000];
const MODES = [
	{ name: 'DFS Pre-Order', traverseMode: 'dfs', order: 'pre' },
	{ name: 'DFS Post-Order', traverseMode: 'dfs', order: 'post' },
	{ name: 'BFS Pre-Order', traverseMode: 'bfs', order: 'pre' },
	{ name: 'BFS Post-Order', traverseMode: 'bfs', order: 'post' },
];

function buildJsTupleTree(NODE_COUNT) {
	const map = new NestedMap();
	for (let i = 0; i < NODE_COUNT; ++i) {
		map.set([i], i);
	}
	return map;
}

function buildTreeModelTree(NODE_COUNT) {
	const tree = new TreeModel();
	let root = tree.parse({ id: 0, children: [] });
	let current = root;
	for (let i = 1; i < NODE_COUNT; ++i) {
		const child = tree.parse({ id: i, children: [] });
		current.addChild(child);
		current = child;
	}
	return root;
}

function buildBintree(NODE_COUNT) {
	const tree = new RBTree((a, b) => a - b);
	for (let i = 0; i < NODE_COUNT; ++i) {
		tree.insert(i);
	}
	return tree;
}

function buildJsTree(NODE_COUNT) {
	let rootObj = { id: 0, children: [] };
	let current = rootObj;
	for (let i = 1; i < NODE_COUNT; ++i) {
		const child = { id: i, children: [] };
		current.children.push(child);
		current = child;
	}
	return new JSTree(rootObj);
}

function dfsPreTreeModel(root, NODE_COUNT) {
	let count = 0;
	root.walk(() => {
		count++;
	});
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function dfsPostTreeModel(root, NODE_COUNT) {
	let count = 0;
	function walk(node) {
		if (node.children) {
			for (const child of node.children) {
				walk(child);
			}
		}
		count++;
	}
	walk(root);
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function bfsPreTreeModel(root, NODE_COUNT) {
	let count = 0;
	const queue = [root];
	while (queue.length) {
		const node = queue.shift();
		count++;
		if (node.children) {
			for (const child of node.children) {
				queue.push(child);
			}
		}
	}
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function bfsPostTreeModel(root, NODE_COUNT) {
	let count = 0;
	function bfsPost(nodes) {
		const nextLevel = [];
		for (const node of nodes) {
			if (node.children) {
				for (const child of node.children) {
					nextLevel.push(child);
				}
			}
		}
		if (nextLevel.length) bfsPost(nextLevel);
		for (const node of nodes) {
			count++;
		}
	}
	bfsPost([root]);
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function dfsPreBintree(tree, NODE_COUNT) {
	let count = 0;
	tree.each(() => {
		count++;
	});
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function dfsPostBintree(tree, NODE_COUNT) {
	let count = 0;
	function walk(node) {
		if (!node) return;
		walk(node.left);
		walk(node.right);
		if (node.hasOwnProperty('key')) count++;
	}
	walk(tree._root);
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function bfsPreBintree(tree, NODE_COUNT) {
	throw new Error('BFS not supported for RBTree');
}

function bfsPostBintree(tree, NODE_COUNT) {
	throw new Error('BFS not supported for RBTree');
}

function dfsPreJsTree(tree, NODE_COUNT) {
	let count = 0;
	function walk(node) {
		count++;
		if (node.children) {
			for (const child of node.children) {
				walk(child);
			}
		}
	}
	walk(tree.obj);
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function dfsPostJsTree(tree, NODE_COUNT) {
	let count = 0;
	function walk(node) {
		if (node.children) {
			for (const child of node.children) {
				walk(child);
			}
		}
		count++;
	}
	walk(tree.obj);
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function bfsPreJsTree(tree, NODE_COUNT) {
	let count = 0;
	const queue = [tree.obj];
	while (queue.length) {
		const node = queue.shift();
		count++;
		if (node.children) {
			for (const child of node.children) {
				queue.push(child);
			}
		}
	}
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function bfsPostJsTree(tree, NODE_COUNT) {
	let count = 0;
	function bfsPost(nodes) {
		const nextLevel = [];
		for (const node of nodes) {
			if (node.children) {
				for (const child of node.children) {
					nextLevel.push(child);
				}
			}
		}
		if (nextLevel.length) bfsPost(nextLevel);
		for (const node of nodes) {
			count++;
		}
	}
	bfsPost([tree.obj]);
	if (count !== NODE_COUNT) throw new Error('Incorrect node count');
}

function runSuite(NODE_COUNT) {
	for (const mode of MODES) {
		console.log(`\n${mode.name} Benchmark (${NODE_COUNT} nodes)\n`);
		const suite = new Benchmark.Suite();
		const failedLibs = [];

		suite
			.add('js-tuple NestedMap', function () {
				const map = buildJsTupleTree(NODE_COUNT);
				let count = 0;
				let traverseMode, yieldMode;
				if (mode.traverseMode === 'dfs') {
					traverseMode = TraverseMode.DepthFirst;
				} else {
					traverseMode = TraverseMode.BreadthFirst;
				}
				if (mode.order === 'pre') {
					yieldMode = YieldMode.PreOrder;
				} else {
					yieldMode = YieldMode.PostOrder;
				}
				for (const value of map.values({ traverseMode, yieldMode })) {
					count++;
				}
				if (count !== NODE_COUNT) throw new Error('Incorrect node count');
			})
			.add('tree-model', function () {
				const root = buildTreeModelTree(NODE_COUNT);
				if (mode.traverseMode === 'dfs' && mode.order === 'pre')
					dfsPreTreeModel(root, NODE_COUNT);
				else if (mode.traverseMode === 'dfs' && mode.order === 'post')
					dfsPostTreeModel(root, NODE_COUNT);
				else if (mode.traverseMode === 'bfs' && mode.order === 'pre')
					bfsPreTreeModel(root, NODE_COUNT);
				else if (mode.traverseMode === 'bfs' && mode.order === 'post')
					bfsPostTreeModel(root, NODE_COUNT);
			})
			.add('bintrees RBTree', function () {
				const tree = buildBintree(NODE_COUNT);
				if (mode.traverseMode === 'dfs' && mode.order === 'pre')
					dfsPreBintree(tree, NODE_COUNT);
				else if (mode.traverseMode === 'dfs' && mode.order === 'post')
					dfsPostBintree(tree, NODE_COUNT);
				else if (mode.traverseMode === 'bfs' && mode.order === 'pre')
					bfsPreBintree(tree, NODE_COUNT);
				else if (mode.traverseMode === 'bfs' && mode.order === 'post')
					bfsPostBintree(tree, NODE_COUNT);
			})
			.add('js-tree', function () {
				const tree = buildJsTree(NODE_COUNT);
				if (mode.traverseMode === 'dfs' && mode.order === 'pre')
					dfsPreJsTree(tree, NODE_COUNT);
				else if (mode.traverseMode === 'dfs' && mode.order === 'post')
					dfsPostJsTree(tree, NODE_COUNT);
				else if (mode.traverseMode === 'bfs' && mode.order === 'pre')
					bfsPreJsTree(tree, NODE_COUNT);
				else if (mode.traverseMode === 'bfs' && mode.order === 'post')
					bfsPostJsTree(tree, NODE_COUNT);
			})
			.on('cycle', function (event) {
				console.log(String(event.target));
			})
			.on('error', function (event) {
				console.log(
					`FAILED: ${event.target.name} (${event.target.error && event.target.error.message})`,
				);
				failedLibs.push(event.target.name);
			})
			.on('complete', function () {
				if (failedLibs.length) {
					console.log(
						`\nLibraries that failed for ${mode.name} ${NODE_COUNT} nodes: ${failedLibs.join(', ')}`,
					);
				}
				console.log(
					`\nFastest for ${mode.name}: ` + this.filter('fastest').map('name'),
				);
				console.log('\n' + '='.repeat(80) + '\n');
				console.log(`${mode.name} Benchmark complete!`);
			})
			.run({ async: false });
	}
}

for (const size of SIZES) {
	runSuite(size);
}
