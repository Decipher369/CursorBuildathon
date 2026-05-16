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
| Business summary dashboard | Done | `/dashboard` — KPIs, charts, recent calls |
| Test agent / simulate | Done | `/demo` — text + audio simulate |
| Dynamic routes (no redirect loop) | Done | `force-dynamic` on `/`, `/dashboard`, `/demo` |
| Inbound call audio (Vercel Blob) | Done | Twilio `play` public URL; Say fallback |
| Supabase Auth + per-user RLS | Not started | MVP uses open anon policies or service role |
| Nasiko integration | Deferred | — |
| Public audio URL for Twilio Play | Done | Vercel Blob + Say fallback |
| Multi-business admin | Not started | API blocks second business |
| SMS / Messaging webhooks | Not started | Voice only |

**Rough completion:** ~90% of planned MVP; auth and Nasiko remain out of scope for the hackathon demo.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/onboarding` or `/dashboard` |
| `/onboarding` | Create one business + assign Twilio number (E.164) |
| `/dashboard` | Business overview — KPIs, charts, recent calls, needs attention |
| `/demo` | Test agent — simulate text/audio calls; optional Twilio reference |

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

Copy [`.env.example`](.env.example) to `.env.local` and fill in values. Required:

- Supabase, OpenAI, ElevenLabs, VALSEA (`VALSEA_API_URL` or per-endpoint URLs)
- Twilio credentials + `NEXT_PUBLIC_APP_URL`
- `BLOB_READ_WRITE_TOKEN` — create a Blob store in Vercel for inbound call audio

Optional: `SUPABASE_SERVICE_ROLE_KEY`, `DEFAULT_BUSINESS_ID`

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

Open http://localhost:3000 → onboarding → **dashboard** (overview). Use **Test agent** (`/demo`) to simulate calls.

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
  dashboard/page.tsx       # Overview (server, dynamic)
  demo/page.tsx            # Test agent (server, dynamic)
  components/Dashboard.tsx # Summary charts + KPIs
  components/DemoPanel.tsx # Simulate calls
  components/dashboard/    # KPI cards, charts, tables
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
