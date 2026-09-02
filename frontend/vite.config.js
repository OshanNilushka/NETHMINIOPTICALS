import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Add this line below to tell Vite that .glb and .gltf files are static assets, not JS files
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    host: true
  }
})