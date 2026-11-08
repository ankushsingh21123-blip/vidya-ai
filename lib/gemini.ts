// lib/gemini.ts
// Small wrapper around the Google Gemini REST API (no SDK needed).
// The API key is read from the server-only env var GEMINI_API_KEY —
// it is never sent to the browser and never hardcoded anywhere.

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GeminiPart = { text: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
type GeminiResponse = { candidates?: GeminiCandidate[]; error?: { message?: string } };

/** Send a prompt to Gemini and return the model's plain-text reply. */
export async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env.local and add your free key from https://aistudio.google.com/app/apikey"
    );
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as GeminiResponse;
    throw new Error(err.error?.message ?? `Gemini API error: ${res.status}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .join("");
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

/** Ask Gemini for JSON and parse it, tolerating markdown code fences. */
export async function askGeminiJson<T>(prompt: string): Promise<T> {
  const raw = await askGemini(`${prompt}\n\nReply with JSON only. No markdown fences, no extra text.`);
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
