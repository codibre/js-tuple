import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	outDir: 'dist/min',
	format: ['cjs', 'esm'],
	dts: true,
	minify: true,
	clean: true,
	tsconfig: 'tsconfig.json',
	splitting: false,
	sourcemap: false,
	shims: false,
});
