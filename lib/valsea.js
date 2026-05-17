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

export async function transcribeAudio(audioBuffer) {
  try {
    const { default: FormData } = await import('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'recording.wav', contentType: 'audio/wav' });
    form.append('model', 'valsea-transcribe');

    const apiKey = process.env.VALSEA_API_KEY;
    if (!apiKey) throw new Error('Missing VALSEA_API_KEY');

    const response = await axios.post(getTranscribeUrl(), form, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...form.getHeaders(),
      },
    });

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
    const apiKey = process.env.VALSEA_API_KEY;
    if (!apiKey) throw new Error('Missing VALSEA_API_KEY');

    const response = await axios.post(
      getSentimentUrl(),
      { text: transcript },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const score = parseFloat(response.data?.score ?? response.data?.sentiment_score ?? 0);
    const label =
      response.data?.label ??
      response.data?.sentiment_label ??
      'neutral';

    if (!['positive', 'neutral', 'negative'].includes(label)) {
      return { score: 0, label: 'neutral' };
    }

    return { score, label };
  } catch {
    return { score: 0, label: 'neutral' };
  }
}
