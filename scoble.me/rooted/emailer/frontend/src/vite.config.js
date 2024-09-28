import { defineConfig } from 'vite';

export default defineConfig({
  base: '/rooted-emailer/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        worker: 'src/worker.js',
      },
    },
  },
});
