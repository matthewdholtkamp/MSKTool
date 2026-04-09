import { buildPlanResponse } from "@msk/msk-content";
import type { AnswerSet, BodyRegion, IntakePayload } from "@msk/msk-content";
import { describe, expect, it } from "vitest";

const intakeFor = (bodyRegion: BodyRegion): IntakePayload => ({
  bodyRegion,
  careLocation: "CTMC",
  chiefComplaint: `Acute ${bodyRegion} pain after training event.`,
  vitals: "BP 120/80, HR 80, RR 16, Temp 98.4F",
  physicalExam: "Focused MSK exam performed.",
  pmh: "None",
  allergies: "NKDA",
  meds: "None",
  priorLabsImaging: ""
});

const cases: Array<{
  name: string;
  bodyRegion: BodyRegion;
  answers: AnswerSet;
  expectedPrimary: string;
  expectedEmergency: boolean;
}> = [
  {
    name: "neck routine",
    bodyRegion: "neck",
    answers: {},
    expectedPrimary: "Acute cervical strain",
    expectedEmergency: false
  },
  {
    name: "neck red flag",
    bodyRegion: "neck",
    answers: { history_red_flags: true },
    expectedPrimary: "Acute neck pain with red-flag findings",
    expectedEmergency: true
  },
  {
    name: "hip routine",
    bodyRegion: "hip",
    answers: { antalgic_gait: true, painful_internal_rotation: true },
    expectedPrimary: "Acute hip soft-tissue or labral-pattern injury",
    expectedEmergency: false
  },
  {
    name: "hip red flag",
    bodyRegion: "hip",
    answers: { stress_fracture_suspected: true },
    expectedPrimary: "Femoral neck or hip stress fracture",
    expectedEmergency: true
  },
  {
    name: "ankle routine",
    bodyRegion: "ankle",
    answers: {
      antalgic_gait: true,
      moderate_edema: true,
      limited_rom: true
    },
    expectedPrimary: "Grade I ankle sprain",
    expectedEmergency: false
  },
  {
    name: "ankle red flag",
    bodyRegion: "ankle",
    answers: { achilles_rupture_signs: true },
    expectedPrimary: "Achilles tendon rupture",
    expectedEmergency: true
  },
  {
    name: "leg routine",
    bodyRegion: "leg",
    answers: { focal_tenderness: true, exercise_paresthesia: true },
    expectedPrimary: "Medial tibial stress syndrome or overuse leg pain",
    expectedEmergency: false
  },
  {
    name: "leg red flag",
    bodyRegion: "leg",
    answers: { dvt_concern: true },
    expectedPrimary: "Deep vein thrombosis concern",
    expectedEmergency: true
  },
  {
    name: "knee routine",
    bodyRegion: "knee",
    answers: { effusion_or_edema: true, decreased_rom: true },
    expectedPrimary: "Acute knee sprain or contusion",
    expectedEmergency: false
  },
  {
    name: "knee red flag",
    bodyRegion: "knee",
    answers: { straight_leg_raise_unable: true },
    expectedPrimary: "Patellar or quadriceps tendon rupture",
    expectedEmergency: true
  },
  {
    name: "shoulder routine",
    bodyRegion: "shoulder",
    answers: { decreased_rom: true },
    expectedPrimary: "Acute shoulder strain or contusion",
    expectedEmergency: false
  },
  {
    name: "shoulder red flag",
    bodyRegion: "shoulder",
    answers: { deformity: true },
    expectedPrimary: "Shoulder fracture, dislocation, or major soft-tissue injury",
    expectedEmergency: true
  },
  {
    name: "arm-elbow routine",
    bodyRegion: "arm-elbow",
    answers: { symptoms_persist: true },
    expectedPrimary: "Arm or elbow soft-tissue injury",
    expectedEmergency: false
  },
  {
    name: "arm-elbow red flag",
    bodyRegion: "arm-elbow",
    answers: { positive_elbow_extension_test: true },
    expectedPrimary: "Elbow or forearm fracture concern",
    expectedEmergency: true
  },
  {
    name: "hand-wrist routine",
    bodyRegion: "hand-wrist",
    answers: { finkelstein_positive: true },
    expectedPrimary: "De Quervain tenosynovitis",
    expectedEmergency: false
  },
  {
    name: "hand-wrist red flag",
    bodyRegion: "hand-wrist",
    answers: { kanavel_signs: true },
    expectedPrimary: "Infectious flexor tenosynovitis",
    expectedEmergency: true
  }
];

describe("algorithm engine across pathways", () => {
  it.each(cases)("$name", ({ bodyRegion, answers, expectedPrimary, expectedEmergency }) => {
    const plan = buildPlanResponse({
      intake: intakeFor(bodyRegion),
      answers
    });

    expect(plan.assessment.ddx[0]?.name).toBe(expectedPrimary);
    expect(plan.plan.isEmergency).toBe(expectedEmergency);
  });
});
