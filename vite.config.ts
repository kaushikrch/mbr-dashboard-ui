import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),           // React Fast Refresh in dev
    tsconfigPaths()    // honor the tsconfig “@/*” alias
  ],
  define: {
    // expose process.env if needed
    "process.env": {}
  }
});
