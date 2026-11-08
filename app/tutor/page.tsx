"use client";

// app/tutor/page.tsx — AI Tutor chat page.
// Sends the conversation to POST /api/chat; the API key stays on the server.

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Message = { role: "user" | "assistant"; content: string };

const EXAMS = ["General", "UPSC", "SSC", "Banking", "NEET", "JEE", "State PSC"];

const SUGGESTIONS = [
  "Explain the Indian Constitution's Preamble in simple words",
  "What is the difference between speed and velocity?",
  "Give me a practice question on percentages",
];

function TutorChat() {
  const params = useSearchParams();
  const [exam, setExam] = useState(params.get("exam") ?? "General");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput("");
    setError("");
    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, exam }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Tutor failed.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">AI Tutor</h1>
      <p className="mt-2 text-slate-600">
        Ask any concept. The tutor explains it simply, shows one worked example,
        and gives you a practice question.
      </p>

      <label className="mt-6 block text-sm font-medium">
        Exam focus
        <select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          className="ml-2 rounded border px-2 py-1"
        >
          {EXAMS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </label>

      <div className="mt-6 space-y-4 rounded-xl border bg-white p-4">
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-slate-500">Try one of these:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border px-3 py-1 text-left text-sm hover:border-saffron hover:text-saffron"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-lg p-3 text-sm ${
              m.role === "user" ? "ml-8 bg-orange-100" : "mr-8 bg-slate-100"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-sm text-slate-500">Tutor is thinking…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a question… e.g. Explain GST in simple words"
          className="flex-1 rounded-lg border px-3 py-2"
        />
        <button
          onClick={() => send()}
          disabled={loading}
          className="rounded-lg bg-saffron px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense>
      <TutorChat />
    </Suspense>
  );
}
