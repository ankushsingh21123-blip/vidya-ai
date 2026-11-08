// app/api/quiz/route.ts
// POST /api/quiz — generate a 5-question MCQ quiz on a topic.
// Body: { topic: string, exam?: string, difficulty?: "easy" | "medium" | "hard" }
// Returns: { questions: [{ question, options[4], answer (0-3), explanation }] }

import { NextResponse } from "next/server";
import { askGeminiJson } from "@/lib/gemini";

export type QuizQuestion = {
  question: string;
  options: string[]; // exactly 4 options
  answer: number; // index of the correct option, 0-3
  explanation: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      topic?: string;
      exam?: string;
      difficulty?: string;
    };
    const topic = body.topic?.trim();
    if (!topic) {
      return NextResponse.json({ error: "No topic provided." }, { status: 400 });
    }
    const difficulty = body.difficulty ?? "medium";
    const exam = body.exam ?? "competitive exams";

    const prompt = `Create a quiz of exactly 5 multiple-choice questions about "${topic}" for Indian ${exam} aspirants, difficulty ${difficulty}.
Each question must have exactly 4 options and exactly one correct answer.
Return an object: {"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"one short sentence"}]}.
The "answer" field is the 0-based index of the correct option.`;

    const data = await askGeminiJson<{ questions: QuizQuestion[] }>(prompt);
    const questions = (data.questions ?? []).slice(0, 5).filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.answer === "number" &&
        q.answer >= 0 &&
        q.answer < 4
    );
    if (questions.length === 0) {
      return NextResponse.json({ error: "Could not generate a quiz. Try another topic." }, { status: 500 });
    }
    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quiz generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
