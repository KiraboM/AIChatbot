import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or your specific framework plugin

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,         // Forces Vite to use port 5173
    strictPort: true,   // True: crashes if 5173 is taken | False: tries 5174 instead
    host: true,         // Exposes the server to your local network (IP address)
  }
})