// tests/mock-bharatcode.mjs — LABELLED MOCK of the BharatCode model API.
// Every reply is prefixed "[MOCK BharatCode — not a live model answer]" so
// mock output can never be mistaken for real AI output in screenshots,
// logs or demos. Used only by the Playwright e2e tests; never in production.
import { createServer } from "node:http";

const LABEL = "[MOCK BharatCode — not a live model answer]";

const quizJson = JSON.stringify({
  questions: [1, 2, 3, 4, 5].map((n) => ({
    question: `${LABEL} Mock question ${n} about the topic?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: 1,
    explanation: `${LABEL} Option B is correct in this mock.`,
  })),
});

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const isQuiz = body.includes("Return an object");
    const content = isQuiz
      ? quizJson
      : `${LABEL}\n1) Simple explanation: this is a mock concept explanation.\n2) Worked example: mock example.\n3) Practice question: mock question?`;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ choices: [{ message: { content } }] }));
  });
});

const port = Number(process.env.MOCK_PORT ?? 4310);
server.listen(port, "127.0.0.1", () => console.log(`mock on ${port}`));
