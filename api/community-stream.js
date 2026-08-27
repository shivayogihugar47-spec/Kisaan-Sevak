/**
 * GET /api/community-stream?username=x&district=y
 *
 * Opens a Server-Sent Events connection.
 * The client holds this open; the server pushes events
 * whenever posts/likes/comments change.
 *
 * Events emitted:
 *   connected    { clientId, message }
 *   new_post     { post }
 *   like_update  { post_id, like_count, liked_by: username }
 *   new_comment  { post_id, comment_count, comment }
 *   stats_update { ... }
 *   heartbeat    (comment line, no event parse needed)
 */

import { registerClient, removeClient, sendHeartbeat } from "./_lib/sseBroker.js";

// Send heartbeat every 20s to keep the connection alive through proxies
const HEARTBEAT_INTERVAL = 20_000;

export default function handler(req, res) {
  const url      = new URL(req.url, "http://localhost");
  const username = String(url.searchParams.get("username") || "").trim();
  const district = String(url.searchParams.get("district") || "").trim();

  // SSE headers — must be set before any write
  res.setHeader("Content-Type",  "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.(); // flush immediately so browser starts reading

  // Register this client in the broker
  const clientId = registerClient(res, { district, username });

  // Send initial "connected" event
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, message: "SSE connected" })}\n\n`);

  // Heartbeat timer (keeps connection alive)
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      cleanup();
    }
  }, HEARTBEAT_INTERVAL);

  function cleanup() {
    clearInterval(heartbeatTimer);
    removeClient(clientId);
    if (!res.writableEnded) {
      try { res.end(); } catch {}
    }
  }

  // Clean up when client disconnects
  req.on("close",   cleanup);
  req.on("error",   cleanup);
  res.on("close",   cleanup);
  res.on("error",   cleanup);

  // Keep the request open indefinitely (never call res.end here)
  // vite.config.js is patched to skip res.end() for SSE responses
}
