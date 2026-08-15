const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';

const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return apiKey;
};

const readGeminiError = async (response) => {
  try {
    const payload = await response.json();
    return payload?.error?.message || `Gemini request failed with status ${response.status}`;
  } catch {
    return `Gemini request failed with status ${response.status}`;
  }
};

export const generateJson = async (prompt) => {
  const apiKey = getApiKey();
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const response = await fetch(`${API_ROOT}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) throw new Error(await readGeminiError(response));

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) throw new Error('Gemini returned an empty response');

  try {
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    throw new Error(`Gemini returned invalid JSON: ${error.message}`);
  }
};

export const embedText = async (text) => {
  const apiKey = getApiKey();
  const model = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';
  const response = await fetch(`${API_ROOT}/${model}:embedContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      output_dimensionality: 768,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) throw new Error(await readGeminiError(response));

  const payload = await response.json();
  const values = payload?.embedding?.values;
  if (!Array.isArray(values) || values.length !== 768) {
    throw new Error(`Expected a 768-dimensional embedding, received ${values?.length || 0}`);
  }

  return values;
};
