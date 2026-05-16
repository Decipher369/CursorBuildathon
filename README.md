# CallSense

AI voice receptionist for Southeast Asia (SEA) businesses. Callers ring a Twilio number; the agent greets them, records their message, transcribes with VALSEA, reasons with OpenAI gpt-4o, replies in ElevenLabs voice, and logs everything to Supabase — all in under 15 seconds.

**Live demo:** https://cursor-buildathon-pi.vercel.app/

---

## What it does

- **Real phone calls** — inbound Twilio calls handled end-to-end with voice AI
- **SEA-tuned transcription** — VALSEA `/v1/audio/transcriptions` with multilingual support
- **Contextual AI agent** — configurable persona, FAQs, hours; remembers returning callers
- **ElevenLabs voice reply** — natural-sounding TTS played back on the live call
- **Sentiment analysis** — every call scored and labelled (positive / neutral / negative)
- **Escalation logic** — auto-flags calls for human follow-up based on threshold
- **Call logs + analytics** — dashboard with KPIs, charts, per-call detail, and Listen button
- **Admin panel** — simulate calls, view live transcript, reference Twilio config

---

## Architecture

```
Inbound call
  └─ Twilio Voice ──► POST /api/twilio/voice  (greet + Record TwiML)
                              │
                        recording URL
                              │
                              ▼
                   POST /api/twilio/process
                     │         │         │
               VALSEA STT  OpenAI     ElevenLabs
               (wav audio)  gpt-4o      TTS
                     │         │         │
                     └────┬────┘         │
                          │         Vercel Blob
                     Supabase           URL
                   (calls table)        │
                                   TwiML <Play>
                                  (caller hears reply)

Dashboard simulate
  └─ POST /api/calls/process  (text input)
  └─ POST /api/calls/from-audio  (audio → VALSEA → process)
```

---

## Implementation status

| Area | Status | Notes |
|------|--------|--------|
| Next.js 16 App Router + Tailwind | Done | Geist fonts |
| Supabase schema + CRUD | Done | `businesses`, `customers`, `calls`, `call_comparisons` |
| MVP RLS (anon policies) | Done | Tighten before production |
| Twilio inbound voice — full pipeline | Done | Record → VALSEA → OpenAI → ElevenLabs → play |
| VALSEA transcription (multipart/form-data) | Done | `/v1/audio/transcriptions`, wav audio |
| VALSEA sentiment analysis | Done | `/v1/sentiment`, graceful fallback |
| OpenAI gpt-4o agent | Done | Intent, response, escalation, JSON mode |
| ElevenLabs TTS | Done | `eleven_multilingual_v2` |
| Customer memory context | Done | Returning callers, call count |
| Vercel Blob audio storage | Done | Public URL for Twilio `<Play>`; `<Say>` fallback |
| Call logs UI + Listen button | Done | Stream base64 audio in browser |
| Dashboard — KPIs + charts | Done | Recharts, sentiment breakdown, escalations |
| Agent config UI | Done | `/agent` — persona, FAQs, hours, voice |
| Admin / simulate panel | Done | `/admin` — text + audio simulate, live transcript |
| Onboarding | Done | `/onboarding` — one business setup |
| Supabase Auth + per-user RLS | Not started | MVP uses open anon policies |
| Multi-business support | Not started | API ready; UI restricts to one |
| SMS / Messaging webhooks | Not started | Voice only |
| Nasiko integration | Deferred | Direct Vercel routes for MVP |

**Status:** Full inbound call pipeline working end-to-end.

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

Copy [`.env.example`](.env.example) to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=        # E.164 e.g. +18152051592
VALSEA_API_KEY=
VALSEA_API_URL=https://api.valsea.ai
VALSEA_TRANSCRIBE_URL=https://api.valsea.ai/v1/audio/transcriptions
VALSEA_SENTIMENT_URL=https://api.valsea.ai/v1/sentiment
NEXT_PUBLIC_APP_URL=        # e.g. https://your-project.vercel.app
BLOB_READ_WRITE_TOKEN=      # from Vercel Storage → Blob
```

> All of these must also be set in **Vercel → Settings → Environment Variables** for Production. `.env.local` is not deployed.

Optional: `SUPABASE_SERVICE_ROLE_KEY`, `DEFAULT_BUSINESS_ID`

### 3. Vercel Blob store

Create a Blob store in **Vercel → Storage → Blob** before deploying. Vercel will auto-populate `BLOB_READ_WRITE_TOKEN`. This is required for ElevenLabs audio to play on live calls (falls back to Twilio `<Say>` if missing).

### 4. Supabase migrations

Run in **Supabase → SQL Editor** (paste SQL contents, not file paths):

1. `supabase/migrations/001_add_twilio_phone_number.sql`
2. `supabase/migrations/002_mvp_rls_policies.sql` — anon CRUD for MVP
3. `supabase/migrations/003_agent_fields.sql` — agent name, persona, FAQs
4. `supabase/migrations/004_add_audio_base64.sql` — Listen button in call logs

### 5. Twilio (Voice, not Messaging)

On your number → **Voice** → **A call comes in**:

- **Webhook:** `POST https://<your-domain>/api/twilio/voice`
- Ensure the number matches `twilio_phone_number` on your business row (E.164, e.g. `+18152051592`)

### 6. Run locally

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
  (root)/page.tsx                   # Redirect to onboarding or dashboard
  onboarding/page.tsx               # Business + Twilio setup
  dashboard/page.tsx                # Analytics overview
  agent/page.tsx                    # Agent persona + FAQ config
  call-logs/page.tsx                # Full call history + detail panel
  admin/page.tsx                    # Simulate calls + Twilio reference
  settings/page.tsx                 # Business settings
  components/
    views/                          # DashboardView, CallLogsView, AdminView, AgentView
    dashboard/                      # KPI cards, charts, recent calls table
    CallAudioListenButton.tsx        # In-browser audio playback (base64)
  api/
    twilio/voice/route.ts           # Inbound TwiML — greet + Record
    twilio/process/route.js         # wav → VALSEA → OpenAI → ElevenLabs → play
    calls/process/route.js          # Text transcript → agent response
    calls/from-audio/route.js       # Audio → VALSEA → process
    calls/[business_id]/route.js    # Call history
    businesses/                     # CRUD
lib/
  process-call-handler.js           # Shared call pipeline (OpenAI + ElevenLabs + Supabase)
  valsea.js                         # Transcription (multipart/form-data) + sentiment
  openai.js                         # gpt-4o with business context + memory
  elevenlabs.js                     # TTS → base64
  audio-storage.js                  # Vercel Blob upload → public URL
  supabase.js                       # DB access helpers
  memory.js                         # Customer history context
  phone.js, config.js, twiml-error.js
supabase/migrations/                # SQL files — run in Supabase SQL Editor
vercel.json                         # maxDuration 60s for process routes
```

---

## Branches

- `main` — production (Vercel)
- `development` — active work; merge to `main` for release

---

## License

Private — buildathon project.
