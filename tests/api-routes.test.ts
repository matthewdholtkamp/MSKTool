import { POST as explainPost } from "../apps/msk-referral/app/api/msk/refine/route";
import { POST as planPost } from "../apps/msk-referral/app/api/msk/plan/route";
import { POST as questionsPost } from "../apps/msk-referral/app/api/msk/questions/route";
import { describe, expect, it } from "vitest";

const intake = {
  bodyRegion: "ankle",
  careLocation: "CTMC",
  chiefComplaint: "Rolled ankle during PT with swelling and painful gait.",
  vitals: "BP 124/78, HR 82",
  physicalExam: "Lateral ankle swelling, tenderness.",
  pmh: "None",
  allergies: "NKDA",
  meds: "None",
  priorLabsImaging: ""
} as const;

describe("API routes", () => {
  it("returns deterministic question nodes", async () => {
    const response = await questionsPost(
      new Request("http://localhost/api/msk/questions", {
        method: "POST",
        body: JSON.stringify(intake)
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.pathway.id).toBe("ankle");
    expect(json.questions.length).toBeGreaterThan(0);
  });

  it("rejects invalid intake payloads", async () => {
    const response = await questionsPost(
      new Request("http://localhost/api/msk/questions", {
        method: "POST",
        body: JSON.stringify({ bodyRegion: "ankle" })
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns a plan with final note draft", async () => {
    const response = await planPost(
      new Request("http://localhost/api/msk/plan", {
        method: "POST",
        body: JSON.stringify({
          intake,
          answers: {
            antalgic_gait: true,
            moderate_edema: true,
            limited_rom: true
          }
        })
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.finalNoteDraft).toContain("Disposition:");
    expect(json.assessment.ddx[0].name).toBe("Grade I ankle sprain");
  });

  it("returns deterministic explanations instead of AI output", async () => {
    const planResponse = await planPost(
      new Request("http://localhost/api/msk/plan", {
        method: "POST",
        body: JSON.stringify({
          intake,
          answers: {
            ottawa_ankle_positive: true
          }
        })
      })
    );
    const planJson = await planResponse.json();

    const response = await explainPost(
      new Request("http://localhost/api/msk/refine", {
        method: "POST",
        body: JSON.stringify({
          caseContext: intake,
          currentPlan: planJson,
          userQuestion: "Why did the tool recommend imaging?"
        })
      })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.answer.toLowerCase()).toContain("page");
  });
});
