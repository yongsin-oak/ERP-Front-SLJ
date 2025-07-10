import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // โหลด .env และ .env.<mode> เช่น .env.production
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        // Explicitly include JSX runtime for Emotion
        jsxImportSource: "@emotion/react",
      }),
    ],
    define: {
      "import.meta.env.VITE_BACKEND_API_URL": JSON.stringify(
        env.VITE_BACKEND_API_URL
      ),
    },
    // Development server configuration
    server: {
      port: 5173,
      host: true,
      // Enable CORS for development
      cors: true,
    },
    // Build configuration
    build: {
      // Generate source maps for easier debugging
      sourcemap: mode === "development",
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            antd: ["antd"],
            utils: ["lodash", "dayjs"],
          },
        },
      },
    },
    // Resolve configuration
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };
});
