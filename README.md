# VidyaAI — AI Study Companion for Indian Competitive-Exam Students

Built for the **BharatCode Build League 2026** by **Ankush Singh**.

VidyaAI helps students preparing for UPSC, SSC, Banking, NEET, JEE and State PSC exams:
- **AI Tutor** — chat with a BharatCode-powered tutor that explains any concept simply,
  shows one worked example, and asks a practice question.
- **Quiz Generator** — type any topic and get a 5-question MCQ quiz (easy / medium / hard),
  with every answer explained and your score saved.
- **Dashboard** — study streak, quizzes taken, average score, and recent quiz history
  (stored in your browser only, via localStorage).

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS. AI via the BharatCode model API
(`qwen-3.8-27b`, standard tier, free for .ac.in/.edu.in students). No SDK — the app
calls the BharatCode REST API with `fetch`, so there is one less dependency to break.
The API key lives only on the server (env var), never in the browser and never in the code.

## Run it locally

```bash
# 1. Install dependencies
npm install

# 2. Get a free BharatCode API key at https://bharatcode.ai (free for .ac.in/.edu.in students)
cp .env.example .env.local
# open .env.local and paste your key after BHARATCODE_API_KEY=

# 3. Start the dev server
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## How it works

- `app/page.tsx` — dashboard (streak, quiz stats, exam links).
- `app/tutor/page.tsx` — chat UI, calls `POST /api/chat`.
- `app/quiz/page.tsx` — quiz UI, calls `POST /api/quiz`, scores answers, saves results.
- `app/api/chat/route.ts` — server route: builds a tutor prompt (last 8 turns) and calls BharatCode.
- `app/api/quiz/route.ts` — server route: asks BharatCode for 5 MCQs as JSON and validates them.
- `lib/bharatcode.ts` — `askBharatCode()` / `askBharatCodeJson()` REST wrapper.
- `lib/storage.ts` — localStorage helpers for quiz results and study streak.

See **EXPLAIN.md** for a line-by-line explanation of every file — useful for the
5-minute demo video and interviews.

## Push to GitHub

```bash
cd ~/workspace/bharatcode-build-league   # or wherever you copied this folder
# 1. Create a new PUBLIC repo on github.com named vidya-ai (do NOT add a README there)
# 2. Then run:
git init
git add .
git commit -m "VidyaAI — AI study companion for BharatCode Build League 2026"
git branch -M main
git remote add origin https://github.com/ankushsingh21123-blip/vidya-ai.git
git push -u origin main
```

Check that the repo is public and that `BharatCode.txt` is in the repo root on GitHub.

## Submit the contest entry (you must do this from your own account)

1. Open the BharatCode Build League page on Unstop.
2. Submit your public GitHub repo link (the `vidya-ai` repo above).
3. Deadline: **10 Nov 2026, 11:59 PM IST**.

Winning gets ₹10,000 + an interview for a ₹60,000/month SDE internship (3 months).
Winning does **not** guarantee the internship — there is a separate interview.

## Notes

- No users, traction, or revenue are claimed for this project. It is a working
  prototype built for the contest.
- The tutor and quiz need a BharatCode API key to work; without one the API routes
  return a clear error telling you to set `BHARATCODE_API_KEY`.
- AI answers can be wrong — the footer reminds students to verify facts from
  official sources.
