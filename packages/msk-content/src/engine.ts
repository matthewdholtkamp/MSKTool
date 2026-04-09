import { pathwayCatalog, referenceCatalog, sharedReferenceBlocks } from "./content";
import type {
  AlgorithmTrace,
  AnswerSet,
  ConditionDefinition,
  FactCondition,
  FactValue,
  IntakePayload,
  PathwayDefinition,
  PlanResponse,
  ProfileTemplate,
  QuestionSet,
  RefineResponse,
  ReferenceEntry,
  RuleConditionGroup,
  SharedReferenceBlock
} from "./types";

const isTruthy = (value: FactValue | undefined) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(value);
};

const matchesCondition = (
  condition: FactCondition,
  answers: AnswerSet
): boolean => {
  const current = answers[condition.fact];

  switch (condition.operator) {
    case "equals":
      return current === condition.value;
    case "notEquals":
      return current !== condition.value;
    case "truthy":
      return isTruthy(current);
    case "falsy":
      return !isTruthy(current);
    case "includes":
      return Array.isArray(current)
        ? current.includes(String(condition.value))
        : String(current ?? "").includes(String(condition.value ?? ""));
    default:
      return false;
  }
};

export const evaluateRuleGroup = (
  group: RuleConditionGroup,
  answers: AnswerSet
): boolean => {
  const allMatches = (group.all ?? []).every((condition) =>
    matchesCondition(condition, answers)
  );
  const anyMatches =
    !group.any || group.any.length === 0
      ? true
      : group.any.some((condition) => matchesCondition(condition, answers));
  const noneMatches = (group.none ?? []).every(
    (condition) => !matchesCondition(condition, answers)
  );

  return allMatches && anyMatches && noneMatches;
};

export const getPathway = (bodyRegion: IntakePayload["bodyRegion"]) => {
  const pathway = pathwayCatalog.find((candidate) => candidate.id === bodyRegion);

  if (!pathway) {
    throw new Error(`Unknown body region: ${bodyRegion}`);
  }

  return pathway;
};

export const getSampleCase = (bodyRegion: IntakePayload["bodyRegion"]) =>
  getPathway(bodyRegion).sampleCase;

export const buildQuestionSet = (intake: IntakePayload): QuestionSet => {
  const pathway = getPathway(intake.bodyRegion);
  const missingDecisionPoints = pathway.decisionNodes;

  return {
    pathway,
    missingDecisionPoints,
    questions: missingDecisionPoints
  };
};

const dedupeStrings = (values: string[]) => [...new Set(values.filter(Boolean))];

const getProfileTemplate = (
  pathway: PathwayDefinition,
  templateId: string
): ProfileTemplate => {
  const template = pathway.profileTemplates.find(
    (candidate) => candidate.id === templateId
  );

  if (!template) {
    throw new Error(
      `Missing profile template ${templateId} for pathway ${pathway.id}`
    );
  }

  return template;
};

const getMatchingConditions = (
  pathway: PathwayDefinition,
  answers: AnswerSet
): ConditionDefinition[] => {
  const specificMatches = pathway.conditions.filter(
    (condition) =>
      !condition.fallback && evaluateRuleGroup(condition.when, answers)
  );

  if (specificMatches.length > 0) {
    return specificMatches;
  }

  const fallback = pathway.conditions.find((condition) => condition.fallback);

  return fallback ? [fallback] : [];
};

const resolveDisposition = (
  intake: IntakePayload,
  primary: ConditionDefinition
) => {
  if (!primary.emergency) {
    return primary.disposition;
  }

  if (intake.careLocation === "ER") {
    return `Urgent ER specialty management: ${primary.disposition}`;
  }

  return `Same-day escalation from ${intake.careLocation}: ${primary.disposition}`;
};

const collectReferences = (
  citationIds: string[],
  sharedBlockIds: string[]
): ReferenceEntry[] => {
  const blockCitationIds = sharedBlockIds.flatMap((blockId) => {
    const block = sharedReferenceBlocks.find((candidate) => candidate.id === blockId);
    return block?.citations ?? [];
  });

  return dedupeStrings([...citationIds, ...blockCitationIds])
    .map((citationId) =>
      referenceCatalog.find((reference) => reference.id === citationId)
    )
    .filter((reference): reference is ReferenceEntry => Boolean(reference));
};

const buildTrace = (
  pathway: PathwayDefinition,
  answers: AnswerSet,
  primary: ConditionDefinition,
  matchedConditions: ConditionDefinition[],
  sharedBlocks: SharedReferenceBlock[]
): AlgorithmTrace => {
  const positiveNodes = pathway.decisionNodes.filter(
    (node) => answers[node.id] === true
  );

  const matchedRedFlags = pathway.redFlags
    .filter((rule) => evaluateRuleGroup(rule.when, answers))
    .map((rule) => ({
      label: rule.title,
      detail: rule.outcome,
      page: rule.page,
      citations: rule.citations
    }));

  const imagingDecisions = pathway.imagingRules
    .filter((rule) => evaluateRuleGroup(rule.when, answers))
    .map((rule) => ({
      label: rule.title,
      detail: `${rule.rationale} Orders: ${rule.orders.join("; ")}`,
      page: rule.page,
      citations: rule.citations
    }));

  const referralDecisions = pathway.referralRules
    .filter((rule) => evaluateRuleGroup(rule.when, answers))
    .map((rule) => ({
      label: rule.title,
      detail: rule.disposition,
      page: rule.page,
      citations: rule.citations
    }));

  const positiveSpecialTests = pathway.specialTests
    .filter((test) => answers[test.id] === true)
    .map((test) => ({
      label: test.name,
      detail: test.positiveFinding,
      page: test.page,
      citations: primary.citations
    }));

  return {
    pathwayId: pathway.id,
    pathwayTitle: pathway.title,
    matchedFacts: positiveNodes.map(
      (node) => `${node.label} (page ${node.evidencePage})`
    ),
    redFlags: matchedRedFlags,
    matchedConditions: matchedConditions.map((condition) => ({
      label: condition.name,
      detail: condition.description,
      page: pathway.primaryPages[0],
      citations: condition.citations
    })),
    imagingDecisions,
    referralDecisions,
    positiveSpecialTests,
    sharedGuidance: sharedBlocks
  };
};

const buildRosBullets = (
  pathway: PathwayDefinition,
  answers: AnswerSet,
  primary: ConditionDefinition
) => {
  const positives = pathway.decisionNodes
    .filter((node) => answers[node.id] === true)
    .slice(0, 4)
    .map((node) => `Positive: ${node.label}.`);

  if (positives.length === 0) {
    return [
      `Positive: acute ${pathway.bodyRegionLabel.toLowerCase()} pain as described in the intake.`,
      "Negative: no algorithmic red flags were selected.",
      "Negative: no additional urgent features were captured in the structured review."
    ];
  }

  return [
    `Positive: acute ${pathway.bodyRegionLabel.toLowerCase()} pain after recent onset.`,
    ...positives,
    primary.emergency
      ? "Negative: do not treat as routine minor soft-tissue injury."
      : "Negative: no emergency-only disposition was triggered by the algorithm."
  ].slice(0, 4);
};

const buildHpiParagraph = (
  intake: IntakePayload,
  primary: ConditionDefinition,
  trace: AlgorithmTrace
) => {
  const factText = trace.matchedFacts.slice(0, 3).join(", ");
  const factSuffix = factText ? ` Key algorithm findings included ${factText}.` : "";

  return `Patient evaluated at ${intake.careLocation} for ${intake.chiefComplaint.trim()}. The structured ${trace.pathwayTitle.toLowerCase()} algorithm most strongly supports ${primary.name.toLowerCase()}, based on the intake, focused exam findings, and pathway decision points.${factSuffix}`;
};

const buildAssessment = (
  pathway: PathwayDefinition,
  primary: ConditionDefinition,
  matchedConditions: ConditionDefinition[]
) => {
  const ddx = matchedConditions
    .map((condition) => ({
      name: condition.name,
      icd10: condition.icd10,
      desc: condition.description,
      likelihood: condition.likelihood
    }))
    .concat(
      pathway.defaultDifferentials
        .filter(
          (candidate) =>
            !matchedConditions.some(
              (match) => match.name.toLowerCase() === candidate.name.toLowerCase()
            )
        )
        .slice(0, 3)
        .map((candidate) => ({
          name: candidate.name,
          icd10: candidate.icd10,
          desc: candidate.description,
          likelihood: candidate.likelihood
        }))
    )
    .slice(0, 3);

  return {
    synthesisStatement: `Primary algorithm output: ${primary.name} (${primary.icd10}). ${primary.description}`,
    ddx
  };
};

export const formatSoapNote = (
  intake: IntakePayload,
  plan: PlanResponse,
  overrides?: {
    workup?: string[];
    treatment?: string[];
    commanderLimitations?: string[];
    profileDays?: number;
  }
) => {
  const workup = overrides?.workup ?? plan.plan.workup;
  const treatment = overrides?.treatment ?? plan.plan.treatment;
  const commanderLimitations =
    overrides?.commanderLimitations ?? plan.plan.profile.commanderLimitations;
  const profileDays = overrides?.profileDays ?? plan.plan.profile.days;

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
    ...(workup.length > 0 ? workup.map((item) => `- ${item}`) : ["- None"]),
    "",
    "Treatment / Education:",
    ...(treatment.length > 0 ? treatment.map((item) => `- ${item}`) : ["- None"]),
    "",
    `Profile (Duration: ${profileDays} days):`,
    "Commander Limitations:",
    ...(commanderLimitations.length > 0
      ? commanderLimitations.map((item) => `- ${item}`)
      : ["- No additional limitations selected."]),
    "Soldier Instructions:",
    ...plan.plan.profile.soldierInstructions.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
};

export const buildPlanResponse = (request: {
  intake: IntakePayload;
  answers: AnswerSet;
}): PlanResponse => {
  const pathway = getPathway(request.intake.bodyRegion);
  const matchedConditions = getMatchingConditions(pathway, request.answers);
  const primary =
    matchedConditions[0] ??
    pathway.conditions.find((condition) => condition.fallback) ??
    pathway.conditions[0];
  const sharedBlocks = (primary.sharedBlockIds ?? [])
    .map((blockId) =>
      sharedReferenceBlocks.find((candidate) => candidate.id === blockId)
    )
    .filter((block): block is SharedReferenceBlock => Boolean(block));
  const trace = buildTrace(
    pathway,
    request.answers,
    primary,
    matchedConditions,
    sharedBlocks
  );
  const profileTemplate = getProfileTemplate(pathway, primary.profileTemplateId);
  const imagingWorkup = pathway.imagingRules
    .filter((rule) => evaluateRuleGroup(rule.when, request.answers))
    .flatMap((rule) => rule.orders);
  const referralWorkup = pathway.referralRules
    .filter((rule) => evaluateRuleGroup(rule.when, request.answers))
    .map((rule) => `Referral: ${rule.disposition}`);
  const workup = dedupeStrings([...primary.workup, ...imagingWorkup, ...referralWorkup]);
  const references = collectReferences(
    dedupeStrings(
      matchedConditions.flatMap((condition) => condition.citations).concat(
        trace.redFlags.flatMap((item) => item.citations),
        trace.imagingDecisions.flatMap((item) => item.citations),
        trace.referralDecisions.flatMap((item) => item.citations)
      )
    ),
    primary.sharedBlockIds ?? []
  );

  const response: PlanResponse = {
    subjective: {
      hpiParagraph: buildHpiParagraph(request.intake, primary, trace),
      rosBullets: buildRosBullets(pathway, request.answers, primary)
    },
    assessment: buildAssessment(pathway, primary, matchedConditions),
    plan: {
      disposition: resolveDisposition(request.intake, primary),
      isEmergency: primary.emergency,
      emergencyReason: primary.emergencyReason ?? null,
      workup,
      treatment: dedupeStrings(primary.treatment),
      profile: {
        days: profileTemplate.durationDays,
        commanderLimitations: profileTemplate.commanderLimitations,
        soldierInstructions: profileTemplate.soldierInstructions
      }
    },
    trace,
    references,
    finalNoteDraft: ""
  };

  response.finalNoteDraft = formatSoapNote(request.intake, response);

  return response;
};

export const explainPlan = (
  intake: IntakePayload,
  plan: PlanResponse,
  userQuestion: string
): RefineResponse => {
  const lower = userQuestion.toLowerCase();
  const firstImaging = plan.trace.imagingDecisions[0];
  const firstReferral = plan.trace.referralDecisions[0];
  const firstRedFlag = plan.trace.redFlags[0];
  const sharedGuidance = plan.trace.sharedGuidance[0];

  if (
    lower.includes("xray") ||
    lower.includes("image") ||
    lower.includes("imaging") ||
    lower.includes("radiograph")
  ) {
    return {
      answer: firstImaging
        ? `${firstImaging.detail} This came from page ${firstImaging.page} of the PDF-backed algorithm.`
        : "No imaging rule was triggered by the recorded answers, so the algorithm did not add routine imaging."
    };
  }

  if (lower.includes("refer") || lower.includes("ortho") || lower.includes("pt")) {
    return {
      answer: firstReferral
        ? `${firstReferral.detail} This referral was triggered by the matched pathway findings.`
        : "No separate referral rule was triggered beyond the main disposition."
    };
  }

  if (lower.includes("profile") || lower.includes("duty")) {
    return {
      answer: `The current profile is ${plan.plan.profile.days} days. Commander limitations are: ${plan.plan.profile.commanderLimitations.join("; ")}.`
    };
  }

  if (lower.includes("why") || lower.includes("reason")) {
    return {
      answer: `${plan.assessment.synthesisStatement} ${
        firstRedFlag ? `A red-flag branch also triggered: ${firstRedFlag.detail}. ` : ""
      }The note and plan are deterministic outputs from the ${getPathway(intake.bodyRegion).title.toLowerCase()} rule set.`
    };
  }

  if (lower.includes("crutch") || lower.includes("weight bear")) {
    return {
      answer: sharedGuidance?.id === "weight-bearing-status"
        ? `${sharedGuidance.summary} ${sharedGuidance.items.join(" ")}`
        : "The selected pathway did not attach a special weight-bearing guidance block."
    };
  }

  return {
    answer: `This tool is algorithm-only. The active pathway is ${plan.trace.pathwayTitle}, the primary output is ${plan.assessment.ddx[0]?.name ?? "the matched condition"}, and the disposition is ${plan.plan.disposition}. Ask about imaging, referral, profile, or rationale for a more specific rule explanation.`
  };
};
