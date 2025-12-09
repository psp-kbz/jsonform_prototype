import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || "http://localhost:3001";

  return {
    plugins: [react()],
    server: {
      port: 3000,
      hmr: {
        protocol: 'wss',
        clientPort: 443,
      },
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    optimizeDeps: {
      include: ['@mui/material', '@mui/icons-material', 'react', 'react-dom'],
    },
  };
});