import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  rollupOptions: {
    output: {
      assetFileNames: "assets/[name]-[hash].[ext]",
      chunkFileNames: "assets/[name]-[hash].js",
      entryFileNames: "assets/[name]-[hash].js",
    },
  },
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      "/api": "http://localhost:5000", 
    },
  },
});
