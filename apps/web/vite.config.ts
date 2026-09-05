import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // packages/shared declares its own react and @tanstack/react-query so
    // it can be typechecked standalone; without this, Vite can resolve
    // two separate instances of each (one via this app, one via shared's
    // own copy), breaking React hooks and/or QueryClientProvider's
    // context. Force a single shared instance across the whole graph.
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
})
