const Benchmark = require('benchmark');
const crypto = require('crypto');

// Import the tuple function directly from TypeScript source
require('ts-node/register');
const { tuple, NestedMap } = require('../src/index.js');

// Create test data
const testArrays = [
	[1, 2, 3],
	['a', 'b', 'c'],
	[1, 'hello', 3],
	[42, 'world', true],
	['x', 'y', 'z'],
	[100, 200, 300],
	['foo', 'bar', 'baz'],
	[1, 2, 3, 4, 5],
	['test', 'data', 'here'],
	[999, 888, 777],
];

// Helper functions for different key generation methods
function createMd5Hash(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

function manualStringify(arr) {
	return arr.join('|');
}

// Initialize maps for each method
const tupleMap = new Map();
const jsonStringifyMap = new Map();
const jsonStringifyMd5Map = new Map();
const manualStringifyMap = new Map();
const manualStringifyMd5Map = new Map();
const nestedMap = new NestedMap();

// Pre-populate maps to test access performance
testArrays.forEach((arr, index) => {
	const tupleKey = tuple(arr);
	const jsonKey = JSON.stringify(arr);
	const jsonMd5Key = createMd5Hash(jsonKey);
	const manualKey = manualStringify(arr);
	const manualMd5Key = createMd5Hash(manualKey);

	tupleMap.set(tupleKey, `value-${index}`);
	jsonStringifyMap.set(jsonKey, `value-${index}`);
	jsonStringifyMd5Map.set(jsonMd5Key, `value-${index}`);
	manualStringifyMap.set(manualKey, `value-${index}`);
	manualStringifyMd5Map.set(manualMd5Key, `value-${index}`);
	nestedMap.set(arr, `value-${index}`);
});

console.log('Starting Map Key Comparison Benchmark\n');

const suite = new Benchmark.Suite();

// Test key creation and map insertion
suite
	.add('Tuple - Create key + Map set', function () {
		const map = new Map();
		for (const arr of testArrays) {
			const key = tuple(arr);
			map.set(key, 'test-value');
		}
	})
	.add('JSON.stringify - Create key + Map set', function () {
		const map = new Map();
		for (const arr of testArrays) {
			const key = JSON.stringify(arr);
			map.set(key, 'test-value');
		}
	})
	.add('JSON.stringify + MD5 - Create key + Map set', function () {
		const map = new Map();
		for (const arr of testArrays) {
			const key = createMd5Hash(JSON.stringify(arr));
			map.set(key, 'test-value');
		}
	})
	.add('Manual stringify - Create key + Map set', function () {
		const map = new Map();
		for (const arr of testArrays) {
			const key = manualStringify(arr);
			map.set(key, 'test-value');
		}
	})
	.add('Manual stringify + MD5 - Create key + Map set', function () {
		const map = new Map();
		for (const arr of testArrays) {
			const key = createMd5Hash(manualStringify(arr));
			map.set(key, 'test-value');
		}
	})
	.add('Nested Map - Direct array as key', function () {
		const nestedMapLocal = new NestedMap();
		for (const arr of testArrays) {
			nestedMapLocal.set(arr, 'test-value');
		}
	})
	.on('cycle', function (event) {
		console.log(String(event.target));
	})
	.on('complete', function () {
		console.log(
			'\nFastest for creation + insertion: ' +
				this.filter('fastest').map('name'),
		);
		console.log('\n' + '='.repeat(80) + '\n');

		// Now test key lookup performance
		const lookupSuite = new Benchmark.Suite();

		lookupSuite
			.add('Tuple - Key lookup', function () {
				for (const arr of testArrays) {
					const key = tuple(arr);
					tupleMap.get(key);
				}
			})
			.add('JSON.stringify - Key lookup', function () {
				for (const arr of testArrays) {
					const key = JSON.stringify(arr);
					jsonStringifyMap.get(key);
				}
			})
			.add('JSON.stringify + MD5 - Key lookup', function () {
				for (const arr of testArrays) {
					const key = createMd5Hash(JSON.stringify(arr));
					jsonStringifyMd5Map.get(key);
				}
			})
			.add('Manual stringify - Key lookup', function () {
				for (const arr of testArrays) {
					const key = manualStringify(arr);
					manualStringifyMap.get(key);
				}
			})
			.add('Manual stringify + MD5 - Key lookup', function () {
				for (const arr of testArrays) {
					const key = createMd5Hash(manualStringify(arr));
					manualStringifyMd5Map.get(key);
				}
			})
			.add('Nested Map - Direct array lookup', function () {
				for (const arr of testArrays) {
					nestedMap.get(arr);
				}
			})
			.on('cycle', function (event) {
				console.log(String(event.target));
			})
			.on('complete', function () {
				console.log(
					'\nFastest for lookup: ' + this.filter('fastest').map('name'),
				);
				console.log('\n' + '='.repeat(80) + '\n');

				// Test memory efficiency by showing cache hits
				console.log('Cache efficiency test (same references):');
				const arr1 = [1, 2, 3];
				const arr2 = [1, 2, 3];

				const tuple1 = tuple(arr1);
				const tuple2 = tuple(arr2);

				console.log(
					'tuple([1, 2, 3]) === tuple([1, 2, 3]):',
					tuple1 === tuple2,
				);
				console.log(
					'JSON.stringify([1, 2, 3]) === JSON.stringify([1, 2, 3]):',
					JSON.stringify(arr1) === JSON.stringify(arr2),
				);
				console.log(
					'Manual stringify same result:',
					manualStringify(arr1) === manualStringify(arr2),
				);

				// Test nested map behavior
				console.log(
					'Nested Map handles value equality properly:',
					nestedMap.get(arr1) === nestedMap.get(arr2), // This will be false since arr1 !== arr2
				);

				console.log('\nBenchmark complete!');
			})
			.run({ async: false });
	})
	.run({ async: false });
