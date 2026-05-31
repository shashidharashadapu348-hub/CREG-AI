import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure production assets resolve correctly on GitHub Pages project sites.
  base: mode === "production" ? process.env.VITE_PUBLIC_BASE || "/CREG-AI/" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-syntax-highlighter")) return "syntax-highlighter";
          if (id.includes("react-markdown") || id.includes("remark-gfm")) return "markdown";
          if (id.includes("recharts")) return "recharts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("react-router-dom")) return "router";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react-dom") || id.includes("react/jsx-runtime") || id.includes("react")) return "react";

          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
