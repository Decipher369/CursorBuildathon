# CallSense

AI voice receptionist for Southeast Asia (SEA) businesses. Callers ring a Twilio number; the agent greets them, records their message, transcribes with VALSEA, reasons with OpenAI GPT-4o, replies in ElevenLabs voice, and logs everything to Supabase — all in under 15 seconds.

**Live demo:** https://cursor-buildathon-pi.vercel.app/

---

## What it does

- **Real phone calls** — inbound Twilio calls handled end-to-end with voice AI; the call loops until the user hangs up
- **Multi-turn conversation** — every turn of a call is stored with `call_sid`; GPT-4o receives the full in-call history so it remembers what was said earlier in the same call
- **Returning caller memory** — when someone calls back, the agent knows their name, call count, last intent, and sentiment trend. *"Welcome back! I see you called about a booking last week — how can I help today?"*
- **SEA-tuned transcription** — VALSEA `/v1/audio/transcriptions` (multipart/form-data, wav audio) with multilingual support
- **Sentiment analysis** — every turn scored and labelled (positive / neutral / negative) via VALSEA `/v1/sentiment`
- **ElevenLabs voice reply** — natural-sounding TTS via Vercel Blob → Twilio `<Play>`; falls back to `<Say>` if Blob is unavailable
- **Silence detection** — 10-second countdown warning then auto-hangup if the caller goes silent
- **Smart escalation** — auto-flags calls for human follow-up based on configurable threshold (negative / neutral / never)
- **AI Setup Assistant** — GPT-4o-powered 7-question onboarding wizard that auto-generates agent persona, FAQs, hours, and name
- **Call logs + analytics** — dashboard with KPIs, charts, sentiment breakdown, per-session chat thread, and in-browser audio playback
- **Supabase Auth** — email/password sign-in with middleware-enforced route protection; Twilio webhooks stay public
- **Admin / simulate panel** — test calls with text or audio upload, view live chat transcript, playback agent audio

---

## Architecture

```
Inbound call
  └─ Twilio Voice ──► POST /api/twilio/voice        (greet + Record TwiML)
                              │
                        recording URL (RecordingSid)
                              │
                              ▼
                   POST /api/twilio/process          (fast — <1s Twilio response)
                     │         │
                  silence?   valid recording?
                     │              │
                 warn + re-record   └──► POST /api/twilio/process-async  (60s budget)
                                               │
                                    ┌──────────┼──────────┐
                               Download wav  VALSEA     VALSEA
                               from Twilio  transcribe  sentiment
                                               │
                                           GPT-4o
                                        (intent + response
                                         + memory context
                                         + conversation history)
                                               │
                                         ElevenLabs TTS
                                               │
                                         Vercel Blob
                                               │
                                    Supabase (calls table)
                                               │
                                       TwiML <Play> + loop
                                      (caller hears reply,
                                       next turn recorded)

Dashboard simulate
  └─ POST /api/calls/process      (text input → full pipeline)
  └─ POST /api/calls/from-audio   (audio upload → VALSEA → pipeline)

AI Setup Assistant
  └─ GET  /api/ai/questionnaire?step=N   (fetch question for step N)
  └─ POST /api/ai/questionnaire          (answers → GPT-4o → business profile)
```

---

## Implementation status

| Area | Status | Notes |
|------|--------|--------|
| Next.js 16 App Router + Tailwind v4 | Done | Geist fonts, glassmorphism UI |
| Supabase schema + CRUD | Done | `businesses`, `customers`, `calls`, `call_comparisons` |
| Supabase Auth (email/password) | Done | Middleware-protected; sign in / sign up / sign out |
| RLS policies | Done | Auth-scoped; Twilio anon INSERT/SELECT allowed |
| Twilio inbound voice — full pipeline | Done | Record → VALSEA → OpenAI → ElevenLabs → play |
| Multi-turn conversation (call_sid loop) | Done | Each turn stored; history fed to GPT-4o |
| Silence detection + countdown | Done | Warns caller; 10s countdown then hangup |
| VALSEA transcription | Done | `/v1/audio/transcriptions`, wav audio, multipart/form-data |
| VALSEA sentiment analysis | Done | `/v1/sentiment`, graceful neutral fallback on error |
| OpenAI GPT-4o agent | Done | Intent, response, escalation, JSON mode |
| ElevenLabs TTS | Done | `eleven_multilingual_v2`, base64 → Vercel Blob |
| Customer memory context | Done | Returning callers, call count, sentiment trend |
| Vercel Blob audio storage | Done | Public URL for Twilio `<Play>`; `<Say>` fallback |
| Call logs UI | Done | Session grouping by call_sid, chat thread, Listen button |
| Caller profile panel | Done | All sessions per phone number, escalation count |
| Dashboard — KPIs + charts | Done | Recharts area + bar charts, gauge, sentiment bars |
| Agent config UI | Done | Persona, FAQs, language, escalation phone |
| AI Setup Assistant | Done | 7-step GPT-4o wizard → auto-fills full agent profile |
| Settings UI | Done | Business profile edit, Twilio webhook copy |
| Admin / simulate panel | Done | Text + audio simulate, live chat transcript, audio playback |
| Onboarding | Done | `/onboarding` — one business setup with Twilio number |
| Multi-business support | Not started | API ready; UI restricts to one per MVP |
| SMS / Messaging webhooks | Not started | Voice only for now |

**Status:** Full inbound call pipeline working end-to-end — transcription, sentiment, multi-turn memory, AI replies, and ElevenLabs voice playback on live calls.

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in / sign up (Supabase Auth) |
| `/` | Redirects to `/onboarding` or dashboard |
| `/onboarding` | Create business + assign Twilio number (E.164) |
| `/dashboard` | Business overview — KPIs, charts, recent calls, needs attention |
| `/agent` | Agent config — persona, FAQs, language + AI Setup Assistant |
| `/call-logs` | Full call history with session grouping and chat thread view |
| `/settings` | Business profile, Twilio webhook URL, escalation threshold |
| `/admin` | Developer: simulate calls, test agent, Twilio webhook reference |
| `/metrics` | Extended analytics |

---

## API routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET/POST | `/api/businesses` | Required | List / create business (MVP: one per user) |
| GET/PATCH | `/api/businesses/[id]` | Required | Get / update business |
| POST | `/api/calls/process` | Required | Text transcript → agent response (simulate) |
| POST | `/api/calls/from-audio` | Required | Audio → VALSEA → agent response (simulate) |
| GET | `/api/calls/[business_id]` | Required | Call history for a business |
| GET | `/api/calls/customer/[phone]` | Required | Customer profile + all calls |
| GET | `/api/ai/questionnaire` | Required | Fetch question for setup wizard step |
| POST | `/api/ai/questionnaire` | Required | Submit answers → GPT-4o generates profile |
| GET | `/api/config/public` | Public | Twilio number + app URL (no secrets) |
| POST | `/api/twilio/voice` | Public (Twilio) | Inbound call TwiML — greet + Record |
| POST | `/api/twilio/process` | Public (Twilio) | Silence check + redirect to async |
| POST | `/api/twilio/process-async` | Public (Twilio) | wav → VALSEA → GPT-4o → ElevenLabs → play |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Decipher369/CursorBuildathon.git
cd CursorBuildathon
npm install
```

### 2. Environment variables

Create `.env.local` with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=          # E.164 e.g. +18152051592
VALSEA_API_KEY=
VALSEA_API_URL=https://api.valsea.ai
VALSEA_TRANSCRIBE_URL=https://api.valsea.ai/v1/audio/transcriptions
VALSEA_SENTIMENT_URL=https://api.valsea.ai/v1/sentiment
NEXT_PUBLIC_APP_URL=          # e.g. https://your-project.vercel.app
BLOB_READ_WRITE_TOKEN=        # from Vercel Storage → Blob
```

> All must also be set in **Vercel → Settings → Environment Variables** for production.

Optional: `SUPABASE_SERVICE_ROLE_KEY`, `DEFAULT_BUSINESS_ID`

### 3. Supabase — Auth setup

1. Go to **Supabase → Authentication → Sign In / Providers → Email**
2. Ensure **Email** provider is enabled
3. Turn off **"Confirm email"** (for development; re-enable for production with SMTP)

### 4. Supabase — Database migrations

Run each file in **Supabase → SQL Editor** in order:

```
supabase/migrations/001_add_twilio_phone_number.sql
supabase/migrations/002_mvp_rls_policies.sql
supabase/migrations/003_agent_fields.sql
supabase/migrations/004_add_audio_base64.sql
supabase/migrations/005_add_call_sid.sql
```

> Migration 006 (auth-scoped RLS + `user_id` on businesses) is recommended before going to production.

### 5. Vercel Blob store

Create a Blob store in **Vercel → Storage → Blob** before deploying. Vercel will auto-populate `BLOB_READ_WRITE_TOKEN`. Required for ElevenLabs audio to play on live calls (falls back to Twilio `<Say>` if missing).

### 6. Twilio — Voice webhook

On your Twilio number → **Voice** → **A call comes in**:

- **Webhook:** `POST https://<your-domain>/api/twilio/voice`
- Ensure the number matches `twilio_phone_number` on your business row (E.164)
- Copy the webhook URL from **Settings → Twilio voice webhook** inside the app

### 7. First-time sign-in

1. Open your app at `/login`
2. Click **Sign Up**, enter email + password
3. You'll land on the dashboard
4. Go to **My Agent → AI Setup Assistant** to configure your agent with a guided wizard, or fill in fields manually

### 8. Run locally

```bash
npm run dev        # http://localhost:3000
npm run build      # verify production build
```

---

## Deploy (Vercel)

1. Connect the repo in Vercel; set all environment variables.
2. Production branch: `main`.
3. After deploy, set Twilio voice webhook to `https://<vercel-url>/api/twilio/voice`.
4. Run Supabase migrations in the production Supabase project.

---

## Project structure

```
app/
  login/page.tsx                     # Sign in / sign up (Supabase Auth)
  onboarding/page.tsx                # Business + Twilio setup
  page.tsx                           # Redirect → onboarding or dashboard
  dashboard/page.tsx
  agent/page.tsx                     # Agent persona, FAQs + AI Setup Assistant
  call-logs/page.tsx
  settings/page.tsx
  admin/page.tsx                     # Simulate calls + Twilio reference
  metrics/page.tsx
  components/
    AppShell.tsx                     # Sidebar nav + topbar + sign out
    CallSenseApp.tsx                 # View router
    CallAudioListenButton.tsx        # In-browser base64 audio playback
    views/
      DashboardView.tsx              # KPIs, charts, gauge, needs attention
      CallLogsView.tsx               # Session list + chat thread + caller profile
      AgentView.tsx                  # Agent config + AI Setup Assistant panel
      SettingsView.tsx               # Business profile + webhook + developer
      AdminView.tsx                  # Simulate calls, live transcript
      SetupAssistantView.tsx         # 7-step GPT-4o onboarding wizard
  api/
    twilio/voice/route.ts            # Inbound TwiML — greet + Record
    twilio/process/route.js          # Silence check → redirect to async
    twilio/process-async/route.js    # Full AI pipeline (60s budget)
    calls/process/route.js           # Text simulate → agent response
    calls/from-audio/route.js        # Audio upload → VALSEA → process
    calls/[business_id]/route.js     # Call history
    calls/customer/[phone]/route.js  # Customer + calls
    businesses/route.js              # List / create
    businesses/[id]/route.js         # Get / update
    ai/questionnaire/route.ts        # Setup wizard questions + GPT-4o synthesis
    config/public/route.js           # Public config (no secrets)
lib/
  process-call-handler.js            # Shared call pipeline orchestrator
  valsea.js                          # Transcription + sentiment via VALSEA
  openai.js                          # GPT-4o with context + memory
  elevenlabs.js                      # TTS → base64
  audio-storage.js                   # Vercel Blob upload → public URL
  supabase.js                        # DB CRUD helpers
  supabase-server.ts                 # SSR Supabase client (cookies)
  supabase-browser.ts                # Browser Supabase client singleton
  memory.js                          # Customer history + conversation history
  call-stats.ts                      # KPI / chart computation (pure functions)
  faqs.ts                            # FAQ parse / serialize helpers
  business-types.ts                  # TypeScript types
  phone.js                           # E.164 normalisation
  config.js                          # Base URL helper
  twiml-error.js                     # TwiML error/response helpers
middleware.ts                        # Route protection — redirects to /login
supabase/migrations/                 # SQL files — run in Supabase SQL Editor
```

---

## Branches

- `main` — production (Vercel auto-deploys)
- `development` — active work; merge to `main` for release

---

## License

Private — buildathon project.
