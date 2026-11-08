"use client";

// app/page.tsx — Dashboard: study streak, past quiz scores, and quick links.
// All stats come from localStorage (lib/storage.ts); nothing leaves the browser.

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadResults, studyStreak, type QuizResult } from "@/lib/storage";

const EXAMS = ["UPSC", "SSC", "Banking", "NEET", "JEE", "State PSC"];

export default function Dashboard() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setResults(loadResults());
    setStreak(studyStreak());
  }, []);

  const totalQuizzes = results.length;
  const avgScore =
    totalQuizzes === 0
      ? 0
      : Math.round(
          (results.reduce((sum, r) => sum + r.score / r.total, 0) / totalQuizzes) * 100
        );

  return (
    <div>
      <h1 className="text-3xl font-bold">Your AI study companion</h1>
      <p className="mt-2 text-slate-600">
        Built for Indian competitive-exam aspirants. Ask the AI tutor anything,
        generate a quiz on any topic, and watch your streak grow.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Study streak</p>
          <p className="mt-1 text-3xl font-bold">{streak} day{streak === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Quizzes taken</p>
          <p className="mt-1 text-3xl font-bold">{totalQuizzes}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Average score</p>
          <p className="mt-1 text-3xl font-bold">{avgScore}%</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/tutor" className="rounded-xl border bg-white p-6 hover:border-saffron">
          <h2 className="text-lg font-semibold">Ask the AI Tutor</h2>
          <p className="mt-1 text-sm text-slate-600">
            Explain any concept, get a worked example, and a practice question — for UPSC,
            SSC, Banking, NEET, JEE and more.
          </p>
        </Link>
        <Link href="/quiz" className="rounded-xl border bg-white p-6 hover:border-saffron">
          <h2 className="text-lg font-semibold">Generate a Quiz</h2>
          <p className="mt-1 text-sm text-slate-600">
            Type any topic — “Indian Constitution”, “Photosynthesis”, “Profit & Loss” —
            and get a 5-question MCQ quiz with answers explained.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Popular exams</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMS.map((exam) => (
            <Link
              key={exam}
              href={`/tutor?exam=${exam}`}
              className="rounded-full border px-3 py-1 text-sm hover:border-saffron hover:text-saffron"
            >
              {exam}
            </Link>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Recent quizzes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[...results].reverse().slice(0, 5).map((r, i) => (
              <li key={i} className="flex justify-between border-b pb-2 last:border-0">
                <span>{r.topic}</span>
                <span className="font-medium">
                  {r.score}/{r.total} · {new Date(r.date).toLocaleDateString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
