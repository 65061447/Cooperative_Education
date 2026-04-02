import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Check if we are building for Electron. 
  // We will set this variable in our package.json script.
  const isElectron = process.env.ELECTRON === 'true';

  return {
    // If Electron: use relative paths './' so the .exe can find assets.
    // If GitHub Pages: use your repository subfolder path.
    base: isElectron ? './' : '/Cooperative_Education/', 
    
    server: {
      host: "::",
      port: 8080,
    },
    
    plugins: [
      react(),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Optional: Ensures assets are handled correctly in the build
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});