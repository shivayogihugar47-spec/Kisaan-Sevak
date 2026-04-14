import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_OTP_API_PROXY_TARGET;

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Your existing OTP API proxy
        "/api": proxyTarget ? {
          target: proxyTarget,
          changeOrigin: true,
        } : undefined,

        // NEW: NVIDIA AI Proxy to bypass CORS
        "/nvidia-api": {
          target: "https://integrate.api.nvidia.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/nvidia-api/, ""),
        },
      },
    },
  };
});