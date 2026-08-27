import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function withResponseHelpers(res) {
  if (typeof res.status !== "function") {
    res.status = function status(code) {
      res.statusCode = code;
      return res;
    };
  }

  if (typeof res.json !== "function") {
    res.json = function json(payload) {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(payload));
      return res;
    };
  }

  if (typeof res.send !== "function") {
    res.send = function send(payload) {
      if (typeof payload === "object" && payload !== null) {
        return res.json(payload);
      }
      res.end(String(payload ?? ""));
      return res;
    };
  }

  return res;
}

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) return {};

  const raw = Buffer.concat(chunks).toString("utf8");
  const contentType = String(req.headers["content-type"] || "").toLowerCase();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  return raw;
}

function localApiPlugin({ enabled }) {
  return {
    name: "local-api-plugin",
    configureServer(server) {
      if (!enabled) return;

      server.middlewares.use(async (req, res, next) => {
        const requestUrl = String(req.url || "");
        if (!requestUrl.startsWith("/api/")) {
          next();
          return;
        }

        const parsedUrl = new URL(requestUrl, "http://localhost");
        const routePath = parsedUrl.pathname.replace(/^\/api\//, "");
        const apiFilePath = path.resolve(process.cwd(), "api", `${routePath}.js`);

        if (!fs.existsSync(apiFilePath)) {
          next();
          return;
        }

        try {
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());
          req.body = ["GET", "HEAD"].includes(String(req.method || "GET").toUpperCase())
            ? {}
            : await readRequestBody(req);

          withResponseHelpers(res);

          const mod = await import(`${pathToFileURL(apiFilePath).href}?t=${Date.now()}`);
          const handler = mod?.default;

          if (typeof handler !== "function") {
            res.status(500).json({ message: `API handler not found for /api/${routePath}` });
            return;
          }

          await handler(req, res);

          // SSE handlers keep the connection open — don't close them
          const isSSE = res.getHeader?.("Content-Type")?.toString().includes("text/event-stream");
          if (!res.writableEnded && !isSSE) {
            res.end();
          }
        } catch (error) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
          }
          if (!res.writableEnded) {
            res.end(JSON.stringify({ message: error?.message || "Local API route failed." }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_OTP_API_PROXY_TARGET;
  const useLocalApiRoutes = !proxyTarget;

  const proxy = {
    "/nvidia-api": {
      target: "https://integrate.api.nvidia.com",
      changeOrigin: true,
      rewrite: (incomingPath) => incomingPath.replace(/^\/nvidia-api/, ""),
    },
  };

  if (proxyTarget) {
    proxy["/api"] = {
      target: proxyTarget,
      changeOrigin: true,
    };
  }

  return {
    plugins: [react(), localApiPlugin({ enabled: useLocalApiRoutes })],
    server: {
      proxy,
    },
  };
});
