import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        "**/docs/qa/**",
        "**/test-results/**",
        "**/playwright-report/**",
        "**/GPT Image/**",
        "**/Nano Banana Image/**",
        "**/Plan/**",
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
