# CallSense

AI voice call agent for Southeast Asia businesses. Callers reach a Twilio number; the stack transcribes speech (VALSEA), reasons with OpenAI, speaks back via ElevenLabs, and stores calls in Supabase.

**Live demo:** https://cursor-buildathon-pi.vercel.app/

---

## Architecture

```
Caller / Dashboard simulate
        │
        ├─ Twilio Voice ──► POST /api/twilio/voice
        │                         │
        │                         ▼ record
        │                   POST /api/twilio/process
        │
        └─ Dashboard ──► POST /api/calls/process  (text)
                      └► POST /api/calls/from-audio (audio → VALSEA)
                                │
                                ▼
                    OpenAI (gpt-4o) + ElevenLabs TTS
                                │
                                ▼
                         Supabase (businesses, customers, calls)
```

**Deferred:** [Nasiko](https://nasiko.com) agent gateway — MVP uses direct Vercel Route Handlers only.

---

## Implementation status

| Area | Status | Notes |
|------|--------|--------|
| Next.js 16 App Router + Tailwind | Done | Geist fonts, dark mode |
| Supabase schema + CRUD | Done | `businesses`, `customers`, `calls`, `call_comparisons` |
| Twilio phone on business row | Done | Migration `001_add_twilio_phone_number.sql` |
| MVP RLS (anon policies) | Done | Migration `002_mvp_rls_policies.sql` — tighten before production |
| OpenAI call processing | Done | Intent, sentiment, response, escalation |
| VALSEA transcribe + sentiment | Done | Text and audio paths |
| ElevenLabs TTS | Done | REST via axios |
| Customer memory context | Done | Returning callers, call count |
| Twilio inbound voice | Done | Record → process → TwiML play |
| Onboarding UI (one business) | Done | `/onboarding` |
| Dashboard UI | Done | Simulate call, history, webhook URL |
| Dynamic routes (no redirect loop) | Done | `force-dynamic` on `/` and `/dashboard` |
| Supabase Auth + per-user RLS | Not started | MVP uses open anon policies or service role |
| Nasiko integration | Deferred | — |
| Public audio URL for Twilio Play | Partial | Uses `data:audio/mpeg;base64` — may need hosted URL |
| Multi-business admin | Not started | API blocks second business |
| SMS / Messaging webhooks | Not started | Voice only |

**Rough completion:** ~85% of planned MVP backend + UI; auth and Nasiko remain out of scope for the hackathon demo.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/onboarding` or `/dashboard` |
| `/onboarding` | Create one business + assign Twilio number (E.164) |
| `/dashboard` | Simulate calls, view history, copy voice webhook URL |

---

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/businesses` | List / create business (MVP: one only) |
| GET | `/api/businesses/[id]` | Get business |
| POST | `/api/calls/process` | Process transcript → agent response |
| POST | `/api/calls/from-audio` | VALSEA transcribe → process |
| GET | `/api/calls/[business_id]` | Call history |
| GET | `/api/calls/customer/[phone_number]` | Customer + calls |
| GET | `/api/config/public` | Twilio number + app URL (no secrets) |
| POST | `/api/twilio/voice` | Inbound call TwiML (record) |
| POST | `/api/twilio/process` | Recording → VALSEA → process → play |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment variables

Copy `.env.local` (not committed). Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
VALSEA_API_KEY=
VALSEA_API_URL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Optional:

```env
SUPABASE_SERVICE_ROLE_KEY=   # server-only; bypasses RLS (preferred over open anon policies)
DEFAULT_BUSINESS_ID=         # fallback if Twilio To doesn't match a row
```

### 3. Supabase migrations

Run in **Supabase → SQL Editor** (paste SQL contents, not file paths):

1. `supabase/migrations/001_add_twilio_phone_number.sql` — column + unique index
2. `supabase/migrations/002_mvp_rls_policies.sql` — anon CRUD for MVP (skip if using service role only)

### 4. Twilio (Voice, not Messaging)

On your number → **Voice** → **A call comes in**:

- **Webhook:** `POST https://<your-domain>/api/twilio/voice`
- Ensure the number matches `twilio_phone_number` on your business row (E.164, e.g. `+18152051592`)

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000 → complete onboarding → dashboard.

```bash
npm run build   # verify production build
```

---

## Deploy (Vercel)

1. Connect repo; set all env vars in Vercel project settings.
2. Production branch: `main`.
3. After deploy, set Twilio voice webhook to `https://<vercel-url>/api/twilio/voice`.

---

## Project structure

```
app/
  onboarding/page.tsx      # Business setup
  dashboard/page.tsx       # Main UI (server, dynamic)
  components/Dashboard.tsx # Client dashboard
  api/                     # Route handlers
lib/
  supabase.js              # DB access
  openai.js, valsea.js, elevenlabs.js, memory.js
  process-call-handler.js  # Shared call pipeline
  phone.js, config.js
supabase/migrations/       # SQL for Supabase dashboard
```

---

## Branches

- `main` — production (Vercel)
- `development` — active work; merge to `main` for release

---

## License

Private — buildathon project.
