// lib/storage.ts
// Tiny localStorage helpers for quiz results and study stats.
// Runs only in the browser ("use client" components import this).

export type QuizResult = {
  topic: string;
  score: number;
  total: number;
  date: string; // ISO date string
};

const QUIZ_KEY = "vidyaai-quiz-results";
const STREAK_KEY = "vidyaai-last-study-date";

export function loadResults(): QuizResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUIZ_KEY) ?? "[]") as QuizResult[];
  } catch {
    return [];
  }
}

export function saveResult(result: QuizResult): QuizResult[] {
  const all = [...loadResults(), result];
  localStorage.setItem(QUIZ_KEY, JSON.stringify(all));
  localStorage.setItem(STREAK_KEY, new Date().toISOString().slice(0, 10));
  return all;
}

/** Days in a row the student has studied, ending today or yesterday. */
export function studyStreak(): number {
  if (typeof window === "undefined") return 0;
  const last = localStorage.getItem(STREAK_KEY);
  if (!last) return 0;
  const today = new Date();
  const lastDate = new Date(last);
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - lastDate.setHours(0, 0, 0, 0)) / 86400000
  );
  if (diffDays > 1) return 0;
  // Count consecutive days backwards from the last study date using saved results.
  const dates = new Set(loadResults().map((r) => r.date.slice(0, 10)));
  let streak = 0;
  const d = new Date(lastDate);
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return Math.max(streak, 1);
}
