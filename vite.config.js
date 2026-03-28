import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/botchok/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    open: false,
    host: true,
  },
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
  }
})