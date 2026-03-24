# Vercel Frontend-Only Setup (Backend Running Locally)

## Why this matters
Your frontend is deployed on Vercel (`https://...`), but your backend is local (`http://localhost:5000`).

A Vercel website cannot directly use your local backend unless you expose it with a public HTTPS URL.

## What was already fixed
- SPA refresh 404 fix via `vercel.json` rewrite to `index.html`.
- Production API fallback no longer assumes `localhost`.

## Required setup for your case

1. Expose local backend using a secure tunnel (HTTPS)
- Example tools: Cloudflare Tunnel, ngrok.
- You will get a public URL like: `https://abc123.ngrok-free.app`

2. In Vercel Project Settings -> Environment Variables, add:
- `VITE_API_BASE_URL = https://abc123.ngrok-free.app/api`

3. Redeploy frontend on Vercel.

4. Ensure backend CORS allows your Vercel domain:
- `https://hostel-portal-jet.vercel.app`

## Important limitation
If your tunnel is stopped, frontend API calls will fail (UI loads, data APIs fail).

## For stable production
Deploy backend to a public host (Render/Railway/Fly.io/etc.) and set:
- `VITE_API_BASE_URL = https://your-backend-domain/api`
