import { buildPlanResponse } from "@msk/msk-content";
import type { BodyRegion, IntakePayload } from "@msk/msk-content";
import { describe, expect, it } from "vitest";

const intakeFor = (bodyRegion: BodyRegion): IntakePayload => ({
  bodyRegion,
  careLocation: "CTMC",
  chiefComplaint: `Acute ${bodyRegion} pain after training.`,
  vitals: "BP 120/80, HR 80, RR 16, Temp 98.4F",
  physicalExam: "Focused exam performed.",
  pmh: "None",
  allergies: "NKDA",
  meds: "None",
  priorLabsImaging: ""
});

describe("focused decision rules", () => {
  it("fires Ottawa ankle imaging", () => {
    const plan = buildPlanResponse({
      intake: intakeFor("ankle"),
      answers: { ottawa_ankle_positive: true }
    });

    expect(plan.plan.workup.join(" ")).toContain("Ankle X-ray: AP, lateral, and mortise views");
  });

  it("fires Ottawa knee imaging", () => {
    const plan = buildPlanResponse({
      intake: intakeFor("knee"),
      answers: { ottawa_knee_positive: true }
    });

    expect(plan.plan.workup.join(" ")).toContain("Knee X-ray: AP and lateral views");
  });

  it("fires Canadian C-spine imaging", () => {
    const plan = buildPlanResponse({
      intake: intakeFor("neck"),
      answers: { cspine_high_risk: true }
    });

    expect(plan.plan.workup.join(" ")).toContain(
      "Cervical spine X-ray: AP, lateral, and open-mouth views"
    );
  });

  it("attaches septic/crystal shared guidance when infection branch is selected", () => {
    const plan = buildPlanResponse({
      intake: intakeFor("ankle"),
      answers: { infection_or_crystal: true }
    });

    expect(plan.trace.sharedGuidance.map((item) => item.id)).toContain(
      "septic-crystal-warning"
    );
  });

  it("attaches vascular guidance for hand vascular compromise", () => {
    const plan = buildPlanResponse({
      intake: intakeFor("hand-wrist"),
      answers: { allen_positive: true }
    });

    expect(plan.trace.sharedGuidance.map((item) => item.id)).toContain(
      "vascular-injury"
    );
    expect(plan.plan.isEmergency).toBe(true);
  });

  it("attaches weight-bearing guidance for protected lower-extremity plans", () => {
    const plan = buildPlanResponse({
      intake: intakeFor("hip"),
      answers: { stress_fracture_suspected: true }
    });

    expect(plan.trace.sharedGuidance.map((item) => item.id)).toContain(
      "weight-bearing-status"
    );
    expect(plan.plan.profile.commanderLimitations.join(" ")).toContain("Crutches");
  });
});
