import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: [
      'unsteered-ned-autoeciously.ngrok-free.dev'
    ]
  }
})