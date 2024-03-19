import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        strictPort: true,
        host: true, // needed for the Docker Container port mapping
        port: 3000,
        watch: {
            usePolling: true,
        },
    },
    build: {
        outDir: "../server/dist/client",
        emptyOutDir: true,
    },
});
