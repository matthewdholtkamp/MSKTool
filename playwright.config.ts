import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/msk-referral/tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run preview:pages",
    cwd: __dirname,
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
