import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The StackBlitz generators import this template's package.json and reuse its
// shared version pins. Keep dependency renames/removals in sync with
// app/src/lib/stackblitz.ts.
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
});
