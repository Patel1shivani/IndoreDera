import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/* Ye app poori tarah standalone hai — main website ke src par koi dependency
   nahi. Dono ke beech data sirf shared API server (localhost:4000) se jaata hai. */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
  },
});
