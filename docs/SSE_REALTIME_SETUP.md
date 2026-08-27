# Real-time SSE Setup Guide

## How it works

```
Farmer posts/likes/comments
        │
        ▼
  /api/community-posts (or -likes, -comments)
        │
        ├─► Saves to Neon DB
        │
        └─► broadcast() → sseBroker.js → all open EventSource connections
                                                │
                                        Browser receives SSE event
                                        and updates feed instantly
```

The `sseBroker.js` module holds active `res` objects in memory.
In **dev** (single Vite process) this works perfectly.
In **production** (serverless/multi-instance) you need a shared pub/sub — see below.

---

## Dev — works out of the box

1. `npm run dev`
2. Open the community page — browser connects to `/api/community-stream`
3. Open a second tab with a different user
4. Post from one tab — the other tab gets the new post **instantly**, no refresh

The live dot in the stats bar turns **green** when SSE is connected, **amber** while reconnecting.

---

## Production (Vercel / Firebase)

Serverless functions don't share memory, so `sseBroker.js` won't work across instances.
Replace it with **Upstash Redis Pub/Sub** (free tier available):

### 1. Install
```bash
npm install @upstash/redis
```

### 2. Create free Redis at https://console.upstash.com

### 3. Add env vars
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 4. Replace `api/_lib/sseBroker.js` broadcast with:
```js
import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function broadcast(event, payload, filter = {}) {
  await redis.publish("community-events", JSON.stringify({ event, payload, filter }));
}
```

### 5. In `community-stream.js`, subscribe with Redis SUBSCRIBE
Use Upstash's `@upstash/redis` streaming API or switch to **Ably/Pusher** (both have free tiers and drop-in SSE/WebSocket support).

---

## Neon DB Webhooks (optional — for external triggers)

Neon supports logical replication webhooks. When configured, Neon calls
`POST /api/community-webhook` every time a row is inserted/updated/deleted.

This means even DB changes from other sources (admin panel, scripts, etc.)
will push to connected browsers.

### Setup steps:

1. Go to **Neon Console → Your Project → Settings → Integrations**
2. Click **Add Webhook**
3. Set URL to: `https://your-domain.com/api/community-webhook`
4. Set secret header: `X-Webhook-Secret: your_secret_value`
5. Subscribe to tables:
   - `public.community_posts` → INSERT
   - `public.community_post_likes` → INSERT, DELETE
   - `public.community_post_comments` → INSERT
6. Add to `.env`:
   ```
   COMMUNITY_WEBHOOK_SECRET=your_secret_value
   ```

The `api/community-webhook.js` handler validates the secret and broadcasts
the SSE event to all connected clients.

---

## Events reference

| SSE event      | Payload fields                                          | Triggered by               |
|----------------|--------------------------------------------------------|----------------------------|
| `connected`    | `{ clientId, message }`                                | On connection              |
| `new_post`     | `{ post: { id, author, content, category_key, ... } }` | POST /api/community-posts  |
| `like_update`  | `{ post_id, like_count, liked_by, action }`            | POST /api/community-post-likes |
| `new_comment`  | `{ post_id, comment_count, comment: { ... } }`        | POST /api/community-post-comments |

---

## What the browser does with each event

| Event         | UI update                                                        |
|---------------|------------------------------------------------------------------|
| `new_post`    | Prepends card to feed with green "✦ NEW" badge (fades after 4s) |
| `like_update` | Updates heart count on the matching card in-place                |
| `new_comment` | Updates comment count badge + appends to open thread             |
