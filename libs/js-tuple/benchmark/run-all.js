const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const benchmarkDir = __dirname;
const files = fs
	.readdirSync(benchmarkDir)
	.filter((f) => f.endsWith('.js') && f !== 'run-all.js');

for (const file of files) {
	console.log(`\nRunning: ${file}`);
	execSync(`node ${path.join(benchmarkDir, file)}`, { stdio: 'inherit' });
}
