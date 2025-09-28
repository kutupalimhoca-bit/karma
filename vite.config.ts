// vite.config.ts
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Express entegrasyonu için özel plugin tanımı
function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Sadece geliştirme modunda çalışır
    configureServer(server) {
      // Sunucu modülünü tembel yükle (lazy-load)
      import("./server").then(({ createServer }) => {
        const app = createServer();

        // Express uygulamasını Vite middleware zincirine ekle
        server.middlewares.use(app);

        // Socket.IO'yu aynı HTTP sunucusunda başlat
        const httpServer = server.httpServer;
        if (httpServer) {
          import("./server/socket").then(({ initSocket }) => {
            initSocket(httpServer);
          });
        }
      });
    },
  };
}

// Vite yapılandırması
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // IPv6 desteği
    port: 8080,
    fs: {
      // Dosya erişim izinleri (özellikle özel klasörler için genişletildi)
      allow: [
        "./client",
        "./shared",
        path.resolve(__dirname, "C:/Users/acer/Desktop/özel program/zen-studio"),
      ],
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem}",
        "**/.git/**",
        "server/**",
      ],
    },
  },
  build: {
    outDir: "dist/spa", // Derleme çıktısı
  },
  plugins: [
    react(), // React SWC plugin
    expressPlugin(), // Express entegrasyonu (geliştirme modunda aktif)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
