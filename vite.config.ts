import { defineConfig } from 'vite';
export default defineConfig({
  root: 'src/renderer',
  build: { outDir: '../../dist/renderer' },
  server: { port: 5173 }
});
