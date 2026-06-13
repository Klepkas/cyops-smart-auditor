import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Smart Contract Auditor.
// React fast-refresh is on by default. We pin the dev server to a stable port
// so the project can be opened from a known URL during local verification.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
