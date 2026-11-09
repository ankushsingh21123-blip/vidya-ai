// app/api/chat/route.ts
// POST /api/chat — AI tutor endpoint.
// Body: { messages: [{ role: "user" | "assistant", content: string }], exam?: string }
// The tutor is instructed to teach, not just give answers: short explanations,
// a worked example, then a practice question for the student.

import { NextResponse } from "next/server";
import { askBharatCode as askGemini } from "@/lib/bharatcode";

type ChatMessage = { role: "user" | "assistant"; content: string };

const TUTOR_SYSTEM = `You are VidyaAI, a friendly AI tutor for Indian competitive-exam students
(UPSC, SSC, Banking, NEET, JEE, state PSCs). Teach in simple, clear English.
Keep answers short (under 200 words unless the student asks for detail).
Structure every answer as: 1) a simple explanation, 2) one worked example,
3) one practice question for the student. If the student asks for a direct
answer to a homework/test question, explain the concept instead of just
giving the answer. Be encouraging.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: ChatMessage[]; exam?: string };
    const messages = body.messages ?? [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser?.content?.trim()) {
      return NextResponse.json({ error: "No question provided." }, { status: 400 });
    }

    // Keep only the last 8 turns so the prompt stays small and cheap.
    const history = messages
      .slice(-8)
      .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
      .join("\n");

    const prompt = `${TUTOR_SYSTEM}\nExam focus: ${body.exam ?? "General competitive exams"}.\n\nConversation so far:\n${history}\n\nTutor:`;
    const reply = await askGemini(prompt);
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tutor failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
