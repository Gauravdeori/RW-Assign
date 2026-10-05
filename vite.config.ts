/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base './' keeps asset paths relative, so the build works on any static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    // Pure logic runs in Node; files that need a DOM say so with a `@vitest-environment jsdom` comment.
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
  },
});
