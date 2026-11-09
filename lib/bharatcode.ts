// lib/bharatcode.ts
// The AI wrapper for VidyaAI, using the BharatCode model API.
// The contest rules (Unstop, checked 9 Nov 2026) say: "Use the BharatCode
// model application programming interface to develop your project."
// This adapter replaced the earlier Google Gemini wrapper (lib/gemini.ts,
// removed 9 Nov 2026) so the entry is compliant. Same function
// names/signatures as the old wrapper, so swapping was only the import in
// the two API routes (aliased there as askGemini / askGeminiJson).
//
// BharatCode is OpenAI-compatible — verified live 9 Nov 2026 against
// BharatCode's own model catalog at https://bharatcode.ai/api/model/v1/models:
//   Base URL: https://bharatcode.ai/api/model/v1
//   Endpoint: POST /chat/completions
//   Auth:     Authorization: Bearer <BHARATCODE_API_KEY>
// Verified live 9 Nov 2026 at https://bharatcode.ai/api/model/v1/models:
//   qwen-3.8-27b (standard tier, live) and deepseek-v4.1-flash (heavy tier,
//   live), both OpenAI chat-completions protocol. Default is the standard-tier
//   model, the safer one on a free student account; set BHARATCODE_MODEL to
//   deepseek-v4.1-flash only if your account has heavy-tier access.
//   Signup: https://bharatcode.ai — free for .ac.in / .edu.in students
const BHARATCODE_MODEL =
  process.env.BHARATCODE_MODEL ?? "qwen-3.8-27b";
const BHARATCODE_URL =
  "https://bharatcode.ai/api/model/v1/chat/completions";

type ChatChoice = {
  message?: { content?: string | null };
  text?: string;
};
type ChatResponse = {
  choices?: ChatChoice[];
  error?: { message?: string };
};

/** Send a prompt to BharatCode and return the model's plain-text reply. */
export async function askBharatCode(prompt: string): Promise<string> {
  const apiKey = process.env.BHARATCODE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BHARATCODE_API_KEY is not set. Sign up at https://bharatcode.ai (free for .ac.in / .edu.in students), copy .env.example to .env.local and add your key."
    );
  }

  const res = await fetch(BHARATCODE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: BHARATCODE_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ChatResponse;
    throw new Error(
      err.error?.message ?? `BharatCode API error: ${res.status}`
    );
  }

  const data = (await res.json()) as ChatResponse;
  const text =
    data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("BharatCode returned an empty response.");
  return text;
}

/** Ask BharatCode for JSON and parse it, tolerating markdown code fences. */
export async function askBharatCodeJson<T>(prompt: string): Promise<T> {
  const raw = await askBharatCode(
    `${prompt}\n\nReply with JSON only. No markdown fences, no extra text.`
  );
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
