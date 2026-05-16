import axios from 'axios';

export async function textToSpeech(text) {
  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!voiceId || !apiKey) {
      throw new Error('Missing ELEVENLABS_VOICE_ID or ELEVENLABS_API_KEY');
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      },
    );

    return Buffer.from(response.data).toString('base64');
  } catch (err) {
    throw new Error(`textToSpeech failed: ${err.message}`);
  }
}
