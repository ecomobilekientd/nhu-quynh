// Cloudflare Pages Function for /api/wishes
// Handles:
//   GET  /api/wishes         -> list all wishes (sorted newest first)
//   POST /api/wishes         -> create a new wish
//
// Required KV binding: WISHES (variable name)
// Optional: RATE_LIMIT_PER_HOUR env var (default 20 wishes per IP per hour)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

const sanitize = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export const onRequestGet = async ({ env }) => {
  if (!env.WISHES) return json({ error: 'KV namespace WISHES not bound' }, 500);
  try {
    const list = await env.WISHES.list({ prefix: 'wish:', limit: 1000 });
    const items = await Promise.all(
      list.keys.map(async (k) => {
        const v = await env.WISHES.get(k.name);
        if (!v) return null;
        try {
          return { key: k.name, ...JSON.parse(v) };
        } catch {
          return null;
        }
      })
    );
    const wishes = items
      .filter(Boolean)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return json({ wishes, count: wishes.length });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
};

export const onRequestPost = async ({ request, env }) => {
  if (!env.WISHES) return json({ error: 'KV namespace WISHES not bound' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const name = sanitize(body.name, 60);
  const message = sanitize(body.message, 400);
  const colorIdx = Math.max(0, Math.min(5, parseInt(body.colorIdx, 10) || 0));

  if (!name || !message) {
    return json({ error: 'Tên và lời chúc không được để trống' }, 400);
  }
  if (message.length < 2) {
    return json({ error: 'Lời chúc hơi ngắn 😅' }, 400);
  }

  // Basic per-IP rate limiting (lightweight, ephemeral)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const limitPerHour = parseInt(env.RATE_LIMIT_PER_HOUR, 10) || 20;
  const rateKey = `rate:${ip}:${Math.floor(Date.now() / 3600000)}`;
  try {
    const current = parseInt(await env.WISHES.get(rateKey), 10) || 0;
    if (current >= limitPerHour) {
      return json({ error: 'Bạn đã gửi nhiều lời chúc trong giờ qua, thử lại sau nhé!' }, 429);
    }
    // Increment with 1-hour TTL
    await env.WISHES.put(rateKey, String(current + 1), { expirationTtl: 3700 });
  } catch (e) {
    // Don't block if rate-limit check fails
    console.error('Rate limit check failed', e);
  }

  const timestamp = Date.now();
  const wish = {
    name,
    message,
    colorIdx,
    timestamp,
    rotation: (Math.random() - 0.5) * 5,
  };
  const key = `wish:${timestamp}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    await env.WISHES.put(key, JSON.stringify(wish));
    return json({ wish: { key, ...wish } }, 201);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
};

// Block other methods
export const onRequest = ({ request }) => {
  return json({ error: `Method ${request.method} not allowed` }, 405);
};
