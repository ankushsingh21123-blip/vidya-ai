import { test, expect } from "@playwright/test";

// All AI content in these tests comes from tests/mock-bharatcode.mjs and is
// prefixed "[MOCK BharatCode — not a live model answer]". No real API key.

test("dashboard renders stats cards and quick links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your AI study companion" })).toBeVisible();
  await expect(page.getByText("Study streak")).toBeVisible();
  await page.screenshot({ path: "shots/01-dashboard.png", fullPage: true });
});

test("tutor flow: question gets a labelled mock reply", async ({ page }) => {
  await page.goto("/tutor");
  await expect(page.getByRole("heading", { name: "AI Tutor" })).toBeVisible();
  await page.getByPlaceholder(/ask|type|question/i).first().fill("What is gravity?");
  await page.getByRole("button", { name: /send|ask/i }).click();
  await expect(page.getByText("[MOCK BharatCode", { exact: false })).toBeVisible();
  await page.screenshot({ path: "shots/02-tutor.png", fullPage: true });
});

test("quiz flow: generate, answer all five, score saved to dashboard", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByPlaceholder(/topic/i).fill("Indian Constitution");
  await page.getByRole("button", { name: /generate quiz/i }).click();
  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await page.screenshot({ path: "shots/03-quiz-q1.png", fullPage: true });
  for (let q = 0; q < 4; q++) {
    await page.getByRole("button", { name: "Option B", exact: true }).click();
    await page.getByRole("button", { name: /next question|see result|finish/i }).click();
  }
  // Decisive-screen mock evidence: the final question AND its explanation
  // must visibly carry the mock label before the result screen replaces them.
  await page.getByRole("button", { name: "Option B", exact: true }).click();
  await expect(page.getByText("[MOCK BharatCode", { exact: false }).first()).toBeVisible();
  await page.screenshot({ path: "shots/04-quiz-q5-labelled-mock.png", fullPage: true });
  await page.getByRole("button", { name: "See result" }).click();
  await expect(page.getByRole("heading", { name: "You scored 5 / 5" })).toBeVisible();
  await page.screenshot({ path: "shots/05-quiz-done.png", fullPage: true });
  await page.goto("/");
  await expect(page.getByText(/1 quiz|Quizzes taken/)).toBeVisible();
  await page.screenshot({ path: "shots/06-dashboard-after.png", fullPage: true });
});

test("mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "shots/07-mobile.png", fullPage: true });
});
