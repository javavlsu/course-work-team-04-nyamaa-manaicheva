import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Все /api/* запросы → backend
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      // Spring Security logout endpoint — не под /api/
      "/logout": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
