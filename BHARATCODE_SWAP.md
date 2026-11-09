# BharatCode swap — make VidyaAI contest-compliant before Tue 10 Nov, 11:59 PM IST

## The problem (found 9 Nov 2026)

The BharatCode Build League rules on Unstop say, Step 3: **"Use the BharatCode
model application programming interface to develop your project."**

VidyaAI as pushed to GitHub on 8 Nov uses **Google Gemini** instead
(`lib/gemini.ts`, `GEMINI_API_KEY`). The repo, `BharatCode.txt`, and the build
are all fine — but as submitted, the entry does not use the BharatCode API,
so it risks being judged non-compliant or marked down. Fix it before
submitting, don't submit the Gemini version and hope.

## What is already done

`lib/bharatcode.ts` is written and type-checks. It mirrors `lib/gemini.ts`
exactly (`askBharatCode` / `askBharatCodeJson`), so the swap is two imports.

Verified live 9 Nov 2026 at https://bharatcode.ai/api/model/v1/models
(no key needed for the catalog):
- Base URL: `https://bharatcode.ai/api/model/v1`
- Endpoint: `POST /chat/completions`, OpenAI-compatible, Bearer auth
- Models live: `qwen-3.8-27b` (standard tier — the default in the adapter)
  and `deepseek-v4.1-flash` (heavy tier — set `BHARATCODE_MODEL` to use it
  only if your account has heavy-tier access)

## Steps — only you can do step 1

1. **Get a BharatCode key (~5 min):** sign up at https://bharatcode.ai
   with your BITS email (`2025eb01841@online.bits-pilani.ac.in`) — student
   access is free for `.ac.in` / `.edu.in` addresses. Copy the key.
2. **In `.env.local`, add:** `BHARATCODE_API_KEY=<your key>`
   (`.env.example` now lists it too. Never commit `.env.local`.)
3. **Swap the two imports:**
   - `app/api/chat/route.ts`: `import { askGemini } from "@/lib/gemini"` →
     `import { askBharatCode as askGemini } from "@/lib/bharatcode"`
   - `app/api/quiz/route.ts`: `import { askGeminiJson } from "@/lib/gemini"` →
     `import { askBharatCodeJson as askGeminiJson } from "@/lib/bharatcode"`
   (Aliasing keeps every other line unchanged.)
4. **Update the two Gemini mentions** so judges see BharatCode, not Gemini:
   - `app/layout.tsx`: "AI answers come from Google Gemini" →
     "AI answers come from the BharatCode model API"
   - `BharatCode.txt` / `README.md`: "Google Gemini API" → "BharatCode model API"
5. **Test locally:**
   ```
   npm run build
   npm run dev
   ```
   Then ask the tutor one question and generate one quiz. If either fails,
   check the key and the model name first — the adapter throws the API's own
   error message.
6. **Push to the same repo** (public, `vidya-ai`) and confirm
   `lib/bharatcode.ts` is in the root listing on GitHub.
7. **Submit on Unstop** with the repo link, project name `VidyaAI`, and a
   short description — by **Tue 10 Nov 2026, 11:59 PM IST**:
   https://unstop.com/college-fests/bharatcode-build-league-build-with-ai-and-win-rs10000-and-a-rs60000-sde-internship-bharatcodeai-528429/amp

## If the key doesn't come through in time

Submit the Gemini version anyway before the deadline rather than missing it
entirely — a submitted entry can be judged on the product, a missed deadline
can't. But say so honestly in the submission description if you do, and
don't claim it uses the BharatCode API when it doesn't.
