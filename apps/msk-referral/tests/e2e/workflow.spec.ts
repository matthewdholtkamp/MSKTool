import { expect, test } from "@playwright/test";

test("ankle workflow completes through final SOAP note", async ({ page }) => {
  const answerQuestion = async (
    heading: string,
    answer: "Yes" | "No"
  ) => {
    await page
      .locator(".question-card")
      .filter({ has: page.getByRole("heading", { name: heading }) })
      .getByRole("button", { name: answer })
      .click();
  };

  await page.goto("/");

  await page.getByRole("button", { name: "Load Sample Case" }).click();
  await page.getByRole("button", { name: "Build Algorithm Questions" }).click();

  await page.getByRole("heading", { name: "Traumatic and Acute Ankle Pain" }).waitFor();

  await answerQuestion("Ottawa ankle positive", "No");
  await answerQuestion("Deformity", "No");
  await answerQuestion("Fibular head tenderness", "No");
  await answerQuestion("Neurovascular compromise", "No");
  await answerQuestion("Achilles rupture signs", "No");
  await answerQuestion("Infection or crystal arthropathy", "No");
  await answerQuestion("Grade II or greater sprain pattern", "No");
  await answerQuestion("Antalgic gait", "Yes");
  await answerQuestion("Moderate edema", "Yes");
  await answerQuestion("Limited ROM", "Yes");
  await answerQuestion("Persistent symptoms", "No");

  await page.getByRole("button", { name: "Generate Deterministic Plan" }).click();

  await expect(page.locator(".assessment-callout").first()).toContainText(
    "Grade I ankle sprain"
  );
  await page.getByRole("button", { name: "Finalize SOAP Note" }).click();

  await expect(page.getByRole("heading", { name: "Final SOAP Note" })).toBeVisible();
  await expect(page.locator(".note-preview")).toContainText("Disposition:");
  await expect(page.getByText("References")).toBeVisible();
});
