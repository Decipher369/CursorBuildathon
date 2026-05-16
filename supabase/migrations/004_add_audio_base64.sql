-- Optional: store agent TTS audio for playback in Call Logs UI
alter table public.calls
  add column if not exists audio_base64 text;
