import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VidyaAI — AI Study Companion for Competitive Exams",
  description:
    "Chat with an AI tutor, generate quizzes on any topic, and track your study streak. Built for the BharatCode Build League 2026.",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/tutor", label: "AI Tutor" },
  { href: "/quiz", label: "Quiz Generator" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold text-ink">
              Vidya<span className="text-saffron">AI</span>
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-slate-600 hover:text-ink">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-slate-400">
          VidyaAI — built for the BharatCode Build League 2026 by Ankush Singh.
          AI answers come from the BharatCode model API; always verify facts from official sources.
        </footer>
      </body>
    </html>
  );
}
