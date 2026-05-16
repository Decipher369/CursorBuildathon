import axios from 'axios';

function getTranscribeUrl() {
  return (
    process.env.VALSEA_TRANSCRIBE_URL ||
    `${process.env.VALSEA_API_URL}/transcribe`
  );
}

function getSentimentUrl() {
  return (
    process.env.VALSEA_SENTIMENT_URL ||
    `${process.env.VALSEA_API_URL}/sentiment`
  );
}

function getAuthHeaders() {
  const apiKey = process.env.VALSEA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing VALSEA_API_KEY');
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export async function transcribeAudio(audio_base64) {
  try {
    const response = await axios.post(
      getTranscribeUrl(),
      { audio: audio_base64, language: 'en-SEA' },
      { headers: getAuthHeaders() },
    );

    const transcript =
      response.data?.transcript ??
      response.data?.text ??
      response.data?.result;

    if (!transcript) {
      throw new Error('VALSEA transcription returned no transcript');
    }

    return transcript;
  } catch (err) {
    throw new Error(`transcribeAudio failed: ${err.message}`);
  }
}

export async function analyzeSentiment(transcript) {
  try {
    const response = await axios.post(
      getSentimentUrl(),
      { text: transcript },
      { headers: getAuthHeaders() },
    );

    const score = parseFloat(response.data?.score ?? response.data?.sentiment_score ?? 0);
    const label =
      response.data?.label ??
      response.data?.sentiment_label ??
      'neutral';

    if (!['positive', 'neutral', 'negative'].includes(label)) {
      return { score, label: 'neutral' };
    }

    return { score, label };
  } catch (err) {
    throw new Error(`analyzeSentiment failed: ${err.message}`);
  }
}
