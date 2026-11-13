import { defineConfig } from 'vite';

// Relative base so dist/ runs from any static host or subpath.
export default defineConfig({
  base: './',
  build: { target: 'es2023' },
});
