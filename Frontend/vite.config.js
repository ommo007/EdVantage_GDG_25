import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/EdVantage_GDG_25/',
  server: {
    hmr: {
      overlay: false, // Disable the error overlay
    },
  },
});
