# VidyaAI — Line-by-Line Explanation

Use this to defend the project in the demo video and in interviews. Every file,
what it does, and why.

## Config files

- **package.json** — project manifest. `next`, `react`, `react-dom` are runtime
  dependencies; TypeScript, Tailwind, autoprefixer and PostCSS are dev-only.
  Scripts: `npm run dev` (local server), `npm run build` (production build),
  `npm start` (serve the production build).
- **next.config.js** — Next.js config; only `reactStrictMode: true` (catches
  common React mistakes in dev).
- **tsconfig.json** — TypeScript settings: `strict: true` (catches type errors),
  `@/*` path alias so `import ... from "@/lib/gemini"` works, JSX preserved
  for Next.js to compile.
- **tailwind.config.js** — Tailwind setup; `content` lists the folders Tailwind
  scans for class names; extends the palette with `ink` (dark slate) and
  `saffron` (orange) brand colours.
- **postcss.config.js** — tells PostCSS to run Tailwind, then autoprefixer
  (adds vendor prefixes so CSS works in older browsers).
- **.env.example** — template for the secret file. Real key goes in `.env.local`,
  which is git-ignored and never committed.
- **.gitignore** — keeps `node_modules`, `.next`, and `.env*` out of git.
- **BharatCode.txt** — contest marker file in the repo root (required by the rules).

## lib/gemini.ts — the AI wrapper

- `GEMINI_MODEL = "gemini-1.5-flash"` — Google's fast, free-tier model.
- `GEMINI_URL` — the REST endpoint for generating content.
- `askGemini(prompt)` — reads `GEMINI_API_KEY` from the server env (throws a
  clear error if missing), POSTs `{ contents: [{ parts: [{ text: prompt }] }] }`
  with temperature 0.7 and a 2048-token cap, checks `res.ok`, and joins the
  returned text parts into one string.
- `askGeminiJson<T>(prompt)` — same call, but asks the model to reply with JSON
  only, then strips any ```json fences before `JSON.parse`. Used by the quiz route.
- Why REST instead of the SDK: fewer dependencies, and the request/response shape
  is visible in one file — easier to explain in a video.

## lib/storage.ts — browser storage

- `QuizResult` — `{ topic, score, total, date }`.
- `loadResults()` / `saveResult()` — read/write the quiz history array in
  localStorage under `vidyaai-quiz-results`; saving also stamps today's date
  under `vidyaai-last-study-date`.
- `studyStreak()` — counts consecutive days with a saved quiz, ending today or
  yesterday; returns 0 if the last study day is older than yesterday.
- All of this runs only in the browser (`typeof window` guard) — Next.js renders
  pages on the server first, where localStorage does not exist.

## app/api/chat/route.ts — POST /api/chat (AI Tutor)

- Reads `{ messages, exam }` from the request body.
- Finds the last user message; 400s if there is none.
- Builds the tutor system prompt: teach in simple English, under 200 words,
  structure = simple explanation → one worked example → one practice question,
  and explain concepts rather than just handing over answers.
- Sends only the last 8 turns as history so the prompt stays small and cheap.
- Calls `askGemini(prompt)` and returns `{ reply }`; errors become a 500 with a
  readable message. The API key never leaves the server.

## app/api/quiz/route.ts — POST /api/quiz (quiz generation)

- Reads `{ topic, exam, difficulty }`; 400s if no topic.
- Prompts Gemini for exactly 5 MCQs with 4 options each, one correct answer,
  plus a one-sentence explanation — as a JSON object.
- Validates every question (has text, exactly 4 options, answer index 0–3)
  and keeps at most 5; 500s if none survive validation.
- Returns `{ questions }`.

## app/layout.tsx — shared shell

- Sets page title/description (metadata), loads `globals.css`.
- Header with the VidyaAI logo and nav (Dashboard / AI Tutor / Quiz Generator).
- Footer with the contest credit and a "verify facts from official sources" note.

## app/globals.css

- The three Tailwind directives (`base`, `components`, `utilities`) plus a light
  background and dark text on `body`.

## app/page.tsx — Dashboard (client component)

- `useEffect` loads quiz results and the streak from localStorage on mount.
- Computes total quizzes and average score (mean of score/total, as a %).
- Three stat cards, two big link cards (Tutor / Quiz), exam chips that link to
  `/tutor?exam=UPSC` etc., and a "Recent quizzes" list (latest 5).

## app/tutor/page.tsx — AI Tutor chat (client component)

- `useSearchParams` reads `?exam=` so dashboard chips pre-select the exam.
- `messages` state holds the conversation; `send()` appends the user message,
  POSTs `{ messages, exam }` to `/api/chat`, appends the reply, and scrolls to
  the bottom. Enter key also sends.
- Suggestion chips give one-click starter questions when the chat is empty.
- Wrapped in `<Suspense>` because `useSearchParams` needs a suspense boundary
  in Next.js App Router.

## app/quiz/page.tsx — Quiz (client component)

- `generate()` POSTs `{ topic, difficulty }` to `/api/quiz` and resets state.
- One question at a time; `answer()` records the pick once and updates the score.
- Correct answers turn green, a wrong pick turns red and the right answer green;
  the explanation shows, then "Next question" / "See result".
- On the last question, `next()` computes the final score (the `score` state
  has not updated yet for that answer, so it adds it manually), saves the result
  with `saveResult()`, and shows the result screen with an encouraging message.

## Data flow, end to end

1. Student types a question in `/tutor` → `fetch("/api/chat")` → `route.ts`
   builds the prompt → `askGemini()` → Gemini REST API → reply back to the page.
2. Student types a topic in `/quiz` → `fetch("/api/quiz")` → `route.ts` asks
   Gemini for JSON → validated questions → page renders them one by one →
   score saved to localStorage → dashboard reads it on next visit.
3. The API key is only ever read inside `lib/gemini.ts` on the server.
