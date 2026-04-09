"use client";

import type {
  AnswerSet,
  BodyRegion,
  DecisionNode,
  IntakePayload,
  PlanResponse,
  QuestionSet,
  RefineResponse
} from "@msk/msk-content";
import {
  buildPlanResponse,
  buildQuestionSet,
  explainPlan,
  intakePayloadSchema,
  planRequestSchema,
  planResponseSchema,
  questionSetSchema,
  refineRequestSchema,
  refineResponseSchema
} from "@msk/msk-content";
import { startTransition, useState } from "react";

const bodyRegionLabels: Record<BodyRegion, string> = {
  neck: "Neck",
  hip: "Hip",
  ankle: "Ankle",
  leg: "Leg",
  knee: "Knee",
  shoulder: "Shoulder",
  "arm-elbow": "Arm / Elbow",
  "hand-wrist": "Hand / Wrist"
};

const sampleCases: Record<BodyRegion, Partial<IntakePayload>> = {
  neck: {
    bodyRegion: "neck",
    careLocation: "CTMC",
    chiefComplaint:
      "Adult soldier with neck pain after a hard training landing, no identifiers included.",
    vitals: "BP 126/80, HR 84, RR 16, Temp 98.6F, SpO2 99%",
    physicalExam:
      "Pain with cervical rotation, no gross motor deficit, midline tenderness absent.",
    pmh: "No prior cervical surgery.",
    allergies: "NKDA",
    meds: "None",
    priorLabsImaging: ""
  },
  hip: {
    bodyRegion: "hip",
    careLocation: "BAS",
    chiefComplaint:
      "Acute right hip and groin pain after running, pain with weight bearing, no identifiers included.",
    vitals: "BP 120/78, HR 76, RR 14, Temp 98.4F, SpO2 99%",
    physicalExam: "Antalgic gait, painful internal rotation, no deformity.",
    pmh: "No known hip disease.",
    allergies: "NKDA",
    meds: "None",
    priorLabsImaging: ""
  },
  ankle: {
    bodyRegion: "ankle",
    careLocation: "CTMC",
    chiefComplaint:
      "Rolled ankle during PT run with immediate swelling and painful weight bearing.",
    vitals: "BP 124/78, HR 82, RR 16, Temp 98.4F, SpO2 98%",
    physicalExam: "Lateral ankle swelling, antalgic gait, tenderness near lateral malleolus.",
    pmh: "No prior ankle surgery.",
    allergies: "NKDA",
    meds: "None",
    priorLabsImaging: ""
  },
  leg: {
    bodyRegion: "leg",
    careLocation: "BAS",
    chiefComplaint:
      "Acute lower-leg pain after increased running volume with focal tibial tenderness.",
    vitals: "BP 118/72, HR 74, RR 14, Temp 98.1F, SpO2 99%",
    physicalExam: "Focal tibial tenderness, mild antalgic gait, distal pulses intact.",
    pmh: "No clotting history.",
    allergies: "NKDA",
    meds: "None",
    priorLabsImaging: ""
  },
  knee: {
    bodyRegion: "knee",
    careLocation: "PCSL",
    chiefComplaint:
      "Acute knee pain after pivoting injury during training with swelling and limited ROM.",
    vitals: "BP 122/76, HR 80, RR 16, Temp 98.2F, SpO2 99%",
    physicalExam: "Effusion present, ROM painful, subjective instability.",
    pmh: "No prior ligament surgery.",
    allergies: "NKDA",
    meds: "Ibuprofen PRN",
    priorLabsImaging: ""
  },
  shoulder: {
    bodyRegion: "shoulder",
    careLocation: "CTMC",
    chiefComplaint:
      "Acute shoulder pain after a fall onto the shoulder with painful overhead motion.",
    vitals: "BP 128/80, HR 78, RR 16, Temp 98.5F, SpO2 99%",
    physicalExam: "Painful active ROM, tenderness over AC region, distal pulses intact.",
    pmh: "No prior shoulder dislocation.",
    allergies: "NKDA",
    meds: "None",
    priorLabsImaging: ""
  },
  "arm-elbow": {
    bodyRegion: "arm-elbow",
    careLocation: "CTMC",
    chiefComplaint:
      "Acute elbow pain after FOOSH with swelling and painful extension.",
    vitals: "BP 124/74, HR 79, RR 16, Temp 98.2F, SpO2 99%",
    physicalExam: "Elbow edema, painful terminal extension, pulses present.",
    pmh: "No prior elbow fracture.",
    allergies: "NKDA",
    meds: "None",
    priorLabsImaging: ""
  },
  "hand-wrist": {
    bodyRegion: "hand-wrist",
    careLocation: "CTMC",
    chiefComplaint:
      "Acute wrist pain after FOOSH with snuffbox tenderness and hand swelling.",
    vitals: "BP 120/70, HR 77, RR 15, Temp 98.3F, SpO2 99%",
    physicalExam: "Hand edema, painful ROM, snuffbox tenderness, cap refill intact.",
    pmh: "No prior fracture.",
    allergies: "NKDA",
    meds: "None",
    priorLabsImaging: ""
  }
};

const emptyIntake: IntakePayload = {
  bodyRegion: "ankle",
  careLocation: "CTMC",
  chiefComplaint: "",
  vitals: "",
  physicalExam: "",
  pmh: "",
  allergies: "",
  meds: "",
  priorLabsImaging: ""
};

const stepTitles = [
  "1. Intake",
  "2. Algorithm Questions",
  "3. Review",
  "4. Final SOAP"
];

function buildSelectedNote(
  intake: IntakePayload,
  plan: PlanResponse,
  selectedWorkup: string[],
  selectedTreatment: string[],
  selectedCommanderLimitations: string[],
  profileDays: number
) {
  const lines = [
    "SUBJECTIVE:",
    plan.subjective.hpiParagraph,
    "",
    "Review of Systems:",
    ...plan.subjective.rosBullets.map((bullet) => `- ${bullet}`),
    "",
    "OBJECTIVE:",
    `Vitals: ${intake.vitals || "Not recorded"}`,
    `Physical Exam: ${intake.physicalExam || "Not recorded"}`,
    `Past Medical History: ${intake.pmh || "None recorded"}`,
    `Allergies: ${intake.allergies || "None recorded"}`,
    `Current Medications: ${intake.meds || "None recorded"}`,
    `Prior Labs/Imaging: ${intake.priorLabsImaging || "None recorded"}`,
    "",
    "ASSESSMENT:",
    plan.assessment.synthesisStatement,
    ...plan.assessment.ddx.map(
      (item) => `- ${item.name} [${item.icd10}] (${item.likelihood}): ${item.desc}`
    ),
    "",
    "PLAN:",
    `Disposition: ${plan.plan.disposition}`,
    "",
    "Workup / Imaging / Consults:",
    ...(selectedWorkup.length > 0
      ? selectedWorkup.map((item) => `- ${item}`)
      : ["- None"]),
    "",
    "Treatment / Education:",
    ...(selectedTreatment.length > 0
      ? selectedTreatment.map((item) => `- ${item}`)
      : ["- None"]),
    "",
    `Profile (Duration: ${profileDays} days):`,
    "Commander Limitations:",
    ...(selectedCommanderLimitations.length > 0
      ? selectedCommanderLimitations.map((item) => `- ${item}`)
      : ["- No additional limitations selected."]),
    "Soldier Instructions:",
    ...plan.plan.profile.soldierInstructions.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
}

function getValidationMessage(issue: unknown, fallback: string) {
  if (issue instanceof Error && issue.message) {
    return issue.message;
  }

  return fallback;
}

function ToggleField({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={checked ? "toggle active" : "toggle"}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-indicator" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function QuestionControl({
  node,
  value,
  onChange
}: {
  node: DecisionNode;
  value: AnswerSet[string];
  onChange: (next: AnswerSet[string]) => void;
}) {
  if (node.type === "boolean") {
    return (
      <div className="boolean-grid">
        <button
          type="button"
          className={value === true ? "choice-button active" : "choice-button"}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={value === false ? "choice-button active" : "choice-button"}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    );
  }

  if (node.type === "select") {
    return (
      <select
        className="select-input"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose one</option>
        {node.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const current = Array.isArray(value) ? value : [];

  return (
    <div className="multi-grid">
      {node.options?.map((option) => {
        const active = current.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            className={active ? "choice-button active" : "choice-button"}
            onClick={() =>
              onChange(
                active
                  ? current.filter((entry) => entry !== option.value)
                  : [...current, option.value]
              )
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function MskReferralApp() {
  const [intake, setIntake] = useState<IntakePayload>(emptyIntake);
  const [step, setStep] = useState(1);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [answers, setAnswers] = useState<AnswerSet>({});
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [selectedWorkup, setSelectedWorkup] = useState<string[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<string[]>([]);
  const [selectedCommanderLimitations, setSelectedCommanderLimitations] =
    useState<string[]>([]);
  const [profileDays, setProfileDays] = useState(7);
  const [explainQuestion, setExplainQuestion] = useState("");
  const [explainAnswer, setExplainAnswer] = useState("");
  const [error, setError] = useState("");
  const [loadingLabel, setLoadingLabel] = useState("");
  const [copied, setCopied] = useState(false);

  const notePreview = plan
    ? buildSelectedNote(
        intake,
        plan,
        selectedWorkup,
        selectedTreatment,
        selectedCommanderLimitations,
        profileDays
      )
    : "";

  const updateIntake = (key: keyof IntakePayload, value: string) => {
    setIntake((current) => ({
      ...current,
      [key]: value
    }));
  };

  const loadSampleCase = () => {
    const sample = sampleCases[intake.bodyRegion];

    setIntake((current) => ({
      ...current,
      ...sample
    }));
  };

  const resetAll = () => {
    setIntake(emptyIntake);
    setStep(1);
    setQuestionSet(null);
    setAnswers({});
    setPlan(null);
    setSelectedWorkup([]);
    setSelectedTreatment([]);
    setSelectedCommanderLimitations([]);
    setProfileDays(7);
    setExplainQuestion("");
    setExplainAnswer("");
    setError("");
    setLoadingLabel("");
    setCopied(false);
  };

  const fetchQuestions = async () => {
    setError("");
    setLoadingLabel("Building focused algorithm questions...");

    try {
      const parsed = intakePayloadSchema.safeParse(intake);

      if (!parsed.success) {
        throw new Error("Please complete the required intake fields before continuing.");
      }

      const data: QuestionSet = questionSetSchema.parse(
        buildQuestionSet(parsed.data)
      );

      startTransition(() => {
        setQuestionSet(data);
        setAnswers({});
        setPlan(null);
        setStep(2);
      });
    } catch (issue) {
      setError(getValidationMessage(issue, "Could not build algorithm questions."));
    } finally {
      setLoadingLabel("");
    }
  };

  const fetchPlan = async () => {
    if (!questionSet) {
      return;
    }

    const unanswered = questionSet.questions.filter(
      (question) => typeof answers[question.id] === "undefined"
    );

    if (unanswered.length > 0) {
      setError("Please answer every algorithm question before generating the plan.");
      return;
    }

    setError("");
    setLoadingLabel("Running deterministic pathway rules...");

    try {
      const parsed = planRequestSchema.safeParse({
        intake,
        answers
      });

      if (!parsed.success) {
        throw new Error("The case data is incomplete or invalid for plan generation.");
      }

      const data: PlanResponse = planResponseSchema.parse(
        buildPlanResponse(parsed.data)
      );

      startTransition(() => {
        setPlan(data);
        setSelectedWorkup(data.plan.workup);
        setSelectedTreatment(data.plan.treatment);
        setSelectedCommanderLimitations(data.plan.profile.commanderLimitations);
        setProfileDays(data.plan.profile.days);
        setStep(3);
      });
    } catch (issue) {
      setError(getValidationMessage(issue, "Could not build the plan."));
    } finally {
      setLoadingLabel("");
    }
  };

  const fetchExplanation = async () => {
    if (!plan || explainQuestion.trim().length < 2) {
      return;
    }

    setError("");
    setExplainAnswer("Explaining the active rule path...");

    try {
      const parsed = refineRequestSchema.safeParse({
        caseContext: intake,
        currentPlan: plan,
        userQuestion: explainQuestion
      });

      if (!parsed.success) {
        throw new Error("Please enter a longer question to explain the rule path.");
      }

      const data: RefineResponse = refineResponseSchema.parse(
        explainPlan(
          parsed.data.caseContext,
          parsed.data.currentPlan,
          parsed.data.userQuestion
        )
      );
      setExplainAnswer(data.answer);
    } catch (issue) {
      setExplainAnswer(
        getValidationMessage(issue, "Could not explain this recommendation.")
      );
    }
  };

  const toggleArrayItem = (
    current: string[],
    value: string,
    setter: (next: string[]) => void
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const copyNote = async () => {
    try {
      await navigator.clipboard.writeText(notePreview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setError("Clipboard copy failed in this browser context.");
    }
  };

  return (
    <main className="shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Army Medicine PDF Algorithms, Encoded Deterministically</p>
          <h1>MSK Screening & Referral Tool</h1>
          <p className="hero-text">
            This build uses no AI or LLM reasoning. Every question, escalation,
            note section, and reference is generated from explicit rules
            transcribed from the source PDF.
          </p>
          <div className="hero-badges">
            <span className="pill">8 acute pathways</span>
            <span className="pill">Strictly algorithmic</span>
            <span className="pill">Legacy tool preserved at <code>/legacy/index.html</code></span>
          </div>
        </div>
        <div className="hero-status">
          <div className="status-card">
            <h2>Workflow</h2>
            <ol className="step-list">
              {stepTitles.map((title, index) => (
                <li
                  key={title}
                  className={step === index + 1 ? "step-item active" : "step-item"}
                >
                  {title}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <details className="warning-panel">
        <summary>De-identified data only</summary>
        <div className="warning-body">
          <p>
            Do not enter names, dates beyond year, phone numbers, email, medical
            record numbers, precise unit identifiers, or unique operational
            details. This tool expects de-identified clinical information only.
          </p>
        </div>
      </details>

      {loadingLabel ? <div className="loading-banner">{loadingLabel}</div> : null}
      {error ? <div className="error-banner">{error}</div> : null}

      {step === 1 ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Step 1</p>
              <h2>Initial Intake</h2>
            </div>
            <button type="button" className="ghost-button" onClick={loadSampleCase}>
              Load Sample Case
            </button>
          </div>

          <div className="grid two-up">
            <label className="field">
              <span>Body Region</span>
              <select
                className="select-input"
                value={intake.bodyRegion}
                onChange={(event) =>
                  updateIntake("bodyRegion", event.target.value as BodyRegion)
                }
              >
                {Object.entries(bodyRegionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Current Care Location</span>
              <select
                className="select-input"
                value={intake.careLocation}
                onChange={(event) =>
                  updateIntake("careLocation", event.target.value)
                }
              >
                <option value="CTMC">CTMC</option>
                <option value="BAS">BAS</option>
                <option value="ER">ER</option>
                <option value="PCSL">PCSL</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Chief Complaint / HPI Context</span>
            <textarea
              className="textarea-input"
              rows={4}
              value={intake.chiefComplaint}
              onChange={(event) => updateIntake("chiefComplaint", event.target.value)}
              placeholder="Describe the complaint without identifiers."
            />
          </label>

          <div className="grid two-up">
            <label className="field">
              <span>Vitals</span>
              <textarea
                className="textarea-input"
                rows={3}
                value={intake.vitals}
                onChange={(event) => updateIntake("vitals", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Physical Exam / Initial Findings</span>
              <textarea
                className="textarea-input"
                rows={3}
                value={intake.physicalExam}
                onChange={(event) => updateIntake("physicalExam", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Current Medications</span>
              <input
                className="text-input"
                value={intake.meds}
                onChange={(event) => updateIntake("meds", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Allergies</span>
              <input
                className="text-input"
                value={intake.allergies}
                onChange={(event) => updateIntake("allergies", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Past Medical History</span>
              <input
                className="text-input"
                value={intake.pmh}
                onChange={(event) => updateIntake("pmh", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Prior Labs / Imaging</span>
              <input
                className="text-input"
                value={intake.priorLabsImaging}
                onChange={(event) =>
                  updateIntake("priorLabsImaging", event.target.value)
                }
              />
            </label>
          </div>

          <div className="panel-actions">
            <button
              type="button"
              className="primary-button"
              onClick={fetchQuestions}
              disabled={intake.chiefComplaint.trim().length < 5}
            >
              Build Algorithm Questions
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 && questionSet ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Step 2</p>
              <h2>{questionSet.pathway.title}</h2>
              <p className="section-copy">{questionSet.pathway.summary}</p>
            </div>
          </div>

          <div className="question-stack">
            {questionSet.questions.map((node) => (
              <article key={node.id} className="question-card">
                <div className="question-meta">
                  <span className="question-category">{node.category}</span>
                  <span className="question-page">PDF page {node.evidencePage}</span>
                </div>
                <h3>{node.label}</h3>
                <p>{node.question}</p>
                {node.helpText ? <p className="help-text">{node.helpText}</p> : null}
                <QuestionControl
                  node={node}
                  value={answers[node.id]}
                  onChange={(next) =>
                    setAnswers((current) => ({
                      ...current,
                      [node.id]: next
                    }))
                  }
                />
              </article>
            ))}
          </div>

          <div className="panel-actions split">
            <button type="button" className="secondary-button" onClick={() => setStep(1)}>
              Back to Intake
            </button>
            <button type="button" className="primary-button" onClick={fetchPlan}>
              Generate Deterministic Plan
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 && plan ? (
        <section className="panel">
          {plan.plan.isEmergency ? (
            <div className="alert-banner">
              <strong>Red flag / urgent branch triggered.</strong>
              <span>{plan.plan.emergencyReason}</span>
            </div>
          ) : null}

          <div className="section-heading">
            <div>
              <p className="section-kicker">Step 3</p>
              <h2>Review the Algorithm Output</h2>
            </div>
          </div>

          <div className="review-grid">
            <article className="review-card">
              <h3>Assessment</h3>
              <p className="assessment-callout">{plan.assessment.synthesisStatement}</p>
              <ul className="detail-list">
                {plan.assessment.ddx.map((entry) => (
                  <li key={entry.name}>
                    <strong>{entry.name}</strong> [{entry.icd10}] ({entry.likelihood})
                    <span>{entry.desc}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="review-card">
              <h3>Disposition</h3>
              <p className="assessment-callout">{plan.plan.disposition}</p>
              <div className="mini-rule-grid">
                <div>
                  <span className="mini-label">Profile days</span>
                  <input
                    type="number"
                    className="number-input"
                    min={1}
                    value={profileDays}
                    onChange={(event) => setProfileDays(Number(event.target.value))}
                  />
                </div>
              </div>
            </article>

            <article className="review-card">
              <h3>Workup / Imaging / Consults</h3>
              <div className="toggle-stack">
                {plan.plan.workup.map((item) => (
                  <ToggleField
                    key={item}
                    checked={selectedWorkup.includes(item)}
                    label={item}
                    onChange={() =>
                      toggleArrayItem(selectedWorkup, item, setSelectedWorkup)
                    }
                  />
                ))}
              </div>
            </article>

            <article className="review-card">
              <h3>Treatment / Education</h3>
              <div className="toggle-stack">
                {plan.plan.treatment.map((item) => (
                  <ToggleField
                    key={item}
                    checked={selectedTreatment.includes(item)}
                    label={item}
                    onChange={() =>
                      toggleArrayItem(selectedTreatment, item, setSelectedTreatment)
                    }
                  />
                ))}
              </div>
            </article>

            <article className="review-card">
              <h3>Commander Limitations</h3>
              <div className="toggle-stack">
                {plan.plan.profile.commanderLimitations.map((item) => (
                  <ToggleField
                    key={item}
                    checked={selectedCommanderLimitations.includes(item)}
                    label={item}
                    onChange={() =>
                      toggleArrayItem(
                        selectedCommanderLimitations,
                        item,
                        setSelectedCommanderLimitations
                      )
                    }
                  />
                ))}
              </div>
            </article>

            <article className="review-card trace-card">
              <h3>Algorithm Trace</h3>
              <div className="trace-section">
                <span className="trace-label">Matched facts</span>
                <ul className="trace-list">
                  {plan.trace.matchedFacts.length > 0 ? (
                    plan.trace.matchedFacts.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>No positive decision nodes were selected.</li>
                  )}
                </ul>
              </div>
              <div className="trace-section">
                <span className="trace-label">Triggered rules</span>
                <ul className="trace-list">
                  {plan.trace.matchedConditions.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {plan.trace.redFlags.length > 0 ? (
                <div className="trace-section">
                  <span className="trace-label">Red flags</span>
                  <ul className="trace-list">
                    {plan.trace.redFlags.map((item) => (
                      <li key={item.label}>
                        <strong>{item.label}</strong>
                        <span>{item.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {plan.trace.imagingDecisions.length > 0 ? (
                <div className="trace-section">
                  <span className="trace-label">Imaging logic</span>
                  <ul className="trace-list">
                    {plan.trace.imagingDecisions.map((item) => (
                      <li key={item.label}>
                        <strong>{item.label}</strong>
                        <span>{item.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {plan.trace.referralDecisions.length > 0 ? (
                <div className="trace-section">
                  <span className="trace-label">Referral logic</span>
                  <ul className="trace-list">
                    {plan.trace.referralDecisions.map((item) => (
                      <li key={item.label}>
                        <strong>{item.label}</strong>
                        <span>{item.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {plan.trace.sharedGuidance.length > 0 ? (
                <div className="trace-section">
                  <span className="trace-label">Shared guidance</span>
                  <ul className="trace-list">
                    {plan.trace.sharedGuidance.map((item) => (
                      <li key={item.id}>
                        <strong>{item.title}</strong>
                        <span>{item.summary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          </div>

          <div className="panel-actions split">
            <button type="button" className="secondary-button" onClick={() => setStep(2)}>
              Back to Questions
            </button>
            <button type="button" className="primary-button" onClick={() => setStep(4)}>
              Finalize SOAP Note
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 && plan ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Step 4</p>
              <h2>Final SOAP Note</h2>
            </div>
            <button type="button" className="ghost-button" onClick={copyNote}>
              {copied ? "Copied" : "Copy Note"}
            </button>
          </div>

          <article className="explain-panel">
            <h3>Explain a Recommendation</h3>
            <p>
              This is a rule explanation, not AI. Ask why imaging, referral,
              profile, or weight-bearing language was selected.
            </p>
            <div className="explain-row">
              <input
                className="text-input"
                value={explainQuestion}
                onChange={(event) => setExplainQuestion(event.target.value)}
                placeholder="Why did the tool recommend imaging?"
              />
              <button type="button" className="primary-button" onClick={fetchExplanation}>
                Explain
              </button>
            </div>
            {explainAnswer ? <p className="explain-answer">{explainAnswer}</p> : null}
          </article>

          <pre className="note-preview">{notePreview}</pre>

          <div className="review-grid final-grid">
            <article className="review-card">
              <h3>References</h3>
              <ul className="detail-list">
                {plan.references.map((reference) => (
                  <li key={reference.id}>
                    <strong>{reference.title}</strong>
                    <span>{reference.citation}</span>
                    {reference.url ? (
                      <a href={reference.url} target="_blank" rel="noreferrer">
                        Open source
                      </a>
                    ) : (
                      <span>PDF page {reference.page}</span>
                    )}
                  </li>
                ))}
              </ul>
            </article>

            <article className="review-card">
              <h3>Shared Guidance Blocks</h3>
              <ul className="detail-list">
                {plan.trace.sharedGuidance.length > 0 ? (
                  plan.trace.sharedGuidance.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span>{item.items.join(" ")}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <strong>No shared addendum blocks were attached.</strong>
                    <span>The final note is driven only by the active pathway.</span>
                  </li>
                )}
              </ul>
            </article>
          </div>

          <div className="panel-actions split">
            <button type="button" className="secondary-button" onClick={() => setStep(3)}>
              Back to Review
            </button>
            <button type="button" className="ghost-button" onClick={resetAll}>
              Start New Case
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
