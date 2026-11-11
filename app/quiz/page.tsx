"use client";

// app/quiz/page.tsx — Quiz generator page.
// POSTs a topic to /api/quiz, shows one question at a time, scores it,
// explains each answer, and saves the result to localStorage (lib/storage.ts).

import { useState } from "react";
import { saveResult } from "@/lib/storage";
import type { QuizQuestion } from "@/app/api/quiz/route";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("medium");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setFinished(false);
    setScore(0);
    setIndex(0);
    setPicked(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Quiz generation failed.");
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function answer(choice: number) {
    if (picked !== null) return; // one answer per question
    setPicked(choice);
    if (choice === questions[index].answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      // The last answer was already counted by answer() in its own click
      // event, so `score` is final here. (Adding it again produced 6/5.)
      setFinished(true);
      saveResult({
        topic: topic.trim(),
        score,
        total: questions.length,
        date: new Date().toISOString(),
      });
    }
  }

  const current = questions[index];

  return (
    <div>
      <h1 className="text-3xl font-bold">Quiz Generator</h1>
      <p className="mt-2 text-slate-600">
        Type any topic and get a 5-question MCQ quiz, with every answer explained.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Topic — e.g. Indian Constitution, Photosynthesis"
          className="min-w-64 flex-1 rounded-lg border px-3 py-2"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
          className="rounded-lg border px-2 py-2"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-saffron px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate quiz"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {current && !finished && (
        <div className="mt-6 rounded-xl border bg-white p-6">
          <p className="text-sm text-slate-500">
            Question {index + 1} of {questions.length} · Score so far: {score}
          </p>
          <h2 className="mt-2 text-lg font-semibold">{current.question}</h2>
          <div className="mt-4 space-y-2">
            {current.options.map((opt, i) => {
              const isAnswer = i === current.answer;
              const isPicked = i === picked;
              const cls =
                picked === null
                  ? "border hover:border-saffron"
                  : isAnswer
                    ? "border-green-500 bg-green-50"
                    : isPicked
                      ? "border-red-500 bg-red-50"
                      : "border";
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  className={`block w-full rounded-lg border px-4 py-2 text-left text-sm ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-4">
              <p className="text-sm">
                {picked === current.answer ? "Correct! " : "Not quite. "}
                {current.explanation}
              </p>
              <button
                onClick={next}
                className="mt-3 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white"
              >
                {index + 1 < questions.length ? "Next question" : "See result"}
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="mt-6 rounded-xl border bg-white p-6 text-center">
          <h2 className="text-2xl font-bold">
            You scored {score} / {questions.length}
          </h2>
          <p className="mt-2 text-slate-600">
            {score === questions.length
              ? "Perfect score — great work!"
              : score >= questions.length / 2
                ? "Good going — review the explanations and try again."
                : "Keep practising — try the AI Tutor for this topic first."}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Saved to your dashboard. Try another topic above.
          </p>
        </div>
      )}
    </div>
  );
  }
