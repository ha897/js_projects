import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      // هل هو يضيف عامل الخدمة تماتيك ام نحن يدويا
      strategies: "injectManifest",
      // موقع عامل الخدمة
      srcDir: "src", // Specify the source directory
      // اسم ملف عامل الخدمة
      filename: "sw.js", // Name of your custom service worker file
      // بوضع التطوير
      devOptions: {
        // تمكين عامل الخدمة من الشعور بالتغييرات والتغيير 
        enabled: true, // to enable debugging at development
        // التعامل مع عامل الخدمه كوحدة برمجية
        type: "module",
      },
      injectManifest: {
        rollupFormat: "es",
        globPatterns: ["**/*.{js,css,html,png,svg,jpg,woff2}"], // Cache built files
      },
    }),
    react(),
  ],
});