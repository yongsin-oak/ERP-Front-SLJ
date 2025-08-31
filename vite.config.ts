import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@enums": path.resolve(__dirname, "./src/enums"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@interfaces": path.resolve(__dirname, "./src/interfaces"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@routes": path.resolve(__dirname, "./src/routes"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@theme": path.resolve(__dirname, "./src/theme"),
        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
  };
});
