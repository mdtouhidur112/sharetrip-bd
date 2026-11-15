import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'admin_', 'FIREBASE_', 'SUPABASE_'],
  server: {
    port: 5173,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion-vendor': ['framer-motion'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
          'icons-vendor': ['lucide-react'],
          'pdf-vendor': ['jspdf', 'html2canvas']
        }
      }
    }
  }
});
