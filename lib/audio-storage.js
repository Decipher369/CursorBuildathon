import { put } from '@vercel/blob';

export async function uploadCallAudio(audio_base64) {
  if (!audio_base64) {
    throw new Error('No audio to upload');
  }

  const buffer = Buffer.from(audio_base64, 'base64');
  const filename = `calls/${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'audio/mpeg',
  });

  return blob.url;
}
