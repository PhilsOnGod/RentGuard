# RentVerify NG — Self-hosting guide

This project is a standard **React + TanStack Start + Supabase** application. Nothing in the runtime is locked to Lovable.

## 1. Get the code

- Push to GitHub from Lovable (`+` menu → GitHub → Connect project), then `git clone` or download the ZIP from GitHub.
- Or use Code Editor → **Download codebase**.

## 2. Point it at your own Supabase project

1. Create a free project at https://supabase.com.
2. In **SQL Editor**, run every file in `supabase/migrations/` in chronological order (or `supabase db push` if you use the Supabase CLI).
3. In **Storage**, create a **private** bucket called `chat-attachments`.
4. In **Authentication → Providers**, enable Email and (optionally) Google. For Google, paste your own OAuth client ID/secret.
5. Copy `.env.example` to `.env` and fill in:

```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your anon/publishable key>

# server-only (used by SSR + server functions)
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<your anon/publishable key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

## 3. Configure the AI scam-check (optional)

The `/risk-check` route uses an OpenAI-compatible API. Use any provider:

```bash
# Example: OpenAI
AI_PROVIDER_BASE_URL=https://api.openai.com/v1
AI_PROVIDER_API_KEY=sk-...
AI_MODEL=gpt-4o-mini

# Example: OpenRouter
AI_PROVIDER_BASE_URL=https://openrouter.ai/api/v1
AI_PROVIDER_API_KEY=sk-or-...
AI_MODEL=google/gemini-2.0-flash-exp
```

If none are set, the feature is disabled with a clear error message.

## 4. Run it

```bash
bun install        # or: npm install
bun run dev        # http://localhost:3000
bun run build      # production build
```

## 5. Deploy

Anywhere that runs Node/Edge SSR: Vercel, Netlify, Cloudflare Pages, Fly, Render. Set the env vars from step 2-3 in your host's dashboard.

## 6. Make yourself admin

After signing up once, run in the Supabase SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
```

## 7. CI security

`.github/workflows/security-audit.yml` runs `bun audit` and `npm audit` on every push/PR (fails on high/critical) plus a weekly scheduled scan.

## Notes on the `src/integrations/lovable` folder

That folder contained a Lovable-managed Google OAuth broker. The current code uses `supabase.auth.signInWithOAuth` directly, so you can safely delete `src/integrations/lovable/` once you've removed any leftover imports (none in `main` currently).
