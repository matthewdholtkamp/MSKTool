import { expect, test } from "@playwright/test";

test("ankle workflow completes through final SOAP note", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /B-3/i }).click();
  await page.getByRole("button", { name: "No Red Flags - Continue" }).click();

  const answer = async (choice: "Yes" | "No") => {
    await page.getByRole("button", { name: choice }).click();
  };

  await answer("No");
  await answer("No");
  await answer("No");
  await answer("No");
  await answer("No");
  await answer("No");
  await answer("No");
  await answer("Yes");
  await answer("Yes");
  await answer("Yes");
  await answer("No");

  await expect(page.getByText("Final Disposition")).toBeVisible();
  await expect(page.locator("#disposition-result")).toHaveText("MCP");
  await expect(page.locator("#summary-text")).toContainText("Grade I ankle sprain");
  await expect(page.getByText("References")).toBeVisible();
});
