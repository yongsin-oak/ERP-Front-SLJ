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
        env.VITE_BACKEND_API_URL,
      ),
      "import.meta.env.VITE_ENV_MODE": JSON.stringify(env.VITE_ENV_MODE),
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
          manualChunks: (id) => {
            if (id.includes("node_modules/antd") || id.includes("node_modules/@ant-design") || id.includes("node_modules/rc-")) return "antd";
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "vendor";
            if (id.includes("node_modules/lodash") || id.includes("node_modules/dayjs")) return "utils";
          },
        },
      },
    },
    // Resolve configuration
    resolve: {
      alias: {
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@design-system": path.resolve(__dirname, "./src/design-system"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@routes": path.resolve(__dirname, "./src/routes"),
        "@dev": path.resolve(__dirname, "./src/dev"),
      },
    },
  };
});
