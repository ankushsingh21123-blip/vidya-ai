import { defineConfig } from "@playwright/test";

// E2E runs the PRODUCTION build (next start) against the labelled
// BharatCode mock. No real API key is used; every AI reply is prefixed
// "[MOCK BharatCode — not a live model answer]".
export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: { baseURL: "http://127.0.0.1:4321" },
  webServer: {
    command:
      "node tests/mock-bharatcode.mjs & MOCK_PID=$!; BHARATCODE_MOCK=1 npx next start -p 4321; kill $MOCK_PID",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
