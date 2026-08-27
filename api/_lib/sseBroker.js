/**
 * In-process SSE broker.
 * Stores active response objects keyed by clientId.
 * Works in Vite's local dev server (single process).
 * In production (Vercel/Firebase Functions), swap this for
 * a shared pub/sub layer (Redis, Upstash, etc.).
 */

// Map<clientId, { res, district, username }>
const clients = new Map();
let _nextId = 1;

export function registerClient(res, { district = "", username = "" } = {}) {
  const id = String(_nextId++);
  clients.set(id, { res, district: district.toLowerCase(), username });
  return id;
}

export function removeClient(id) {
  clients.delete(id);
}

export function getClientCount() {
  return clients.size;
}

/**
 * Broadcast an SSE event to matching clients.
 * @param {string} event   - SSE event name (e.g. "new_post", "like_update")
 * @param {object} payload - JSON payload
 * @param {object} filter  - optional { district } to broadcast only to matching clients
 */
export function broadcast(event, payload, filter = {}) {
  const filterDistrict = filter.district ? filter.district.toLowerCase() : null;
  const data = JSON.stringify(payload);

  for (const [id, client] of clients.entries()) {
    // district filter: send if no filter, or client has no district, or districts match
    if (filterDistrict && client.district && client.district !== filterDistrict) {
      continue;
    }
    try {
      client.res.write(`event: ${event}\ndata: ${data}\n\n`);
    } catch {
      // dead connection — clean up
      clients.delete(id);
    }
  }
}

export function sendHeartbeat() {
  for (const [id, client] of clients.entries()) {
    try {
      client.res.write(": heartbeat\n\n");
    } catch {
      clients.delete(id);
    }
  }
}
