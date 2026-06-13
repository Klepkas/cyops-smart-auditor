import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for the Smart Contract Auditor.
 *
 * - `server.host = '127.0.0.1'`: bind the dev server to a stable
 *   loopback so the project opens from a known URL during local
 *   verification. Also mitigates the Vite 5 / esbuild dev-server
 *   audit warning.
 * - `build.rollupOptions.output.manualChunks`: the Auditor page
 *   pulls in CodeMirror 6 + Recharts, which together account for
 *   ~70% of the main bundle. We split them out into named vendor
 *   chunks so the shell route (Dashboard / History / Settings)
 *   loads in a fraction of the time. The split is keyed off the
 *   package name so the same chunk is reused across routes.
 */
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('codemirror') || id.includes('@uiw/react-codemirror') || id.includes('@codemirror/')) {
            return 'vendor-codemirror';
          }
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
            return 'vendor-recharts';
          }
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          return 'vendor';
        },
      },
    },
  },
});
