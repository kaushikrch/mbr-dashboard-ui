// craco.config.js
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

module.exports = {
  webpack: {
    alias: {
      "@":           path.resolve(__dirname, "src"),
      "@/components": path.resolve(__dirname, "src/components")
    }
  },
  babel: {
    // Only ever include react-refresh/babel once, and only in dev
    plugins: [
      isDev && require.resolve("react-refresh/babel")
    ].filter(Boolean)
  }
};
