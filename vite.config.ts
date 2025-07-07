import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [
    react(),         // React Refresh in dev
    tsconfigPaths()  // pick up your tsconfig “@/*” mapping
  ],
  resolve: {
    alias: {
      // make sure @ always points at your src/ folder
      "@": path.resolve(__dirname, "src")
    }
  },
  define: {
    // if you rely on process.env anywhere
    "process.env": {}
  }
});
