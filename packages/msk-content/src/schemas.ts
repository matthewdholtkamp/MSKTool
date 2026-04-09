import { z } from "zod";

export const bodyRegionSchema = z.enum([
  "neck",
  "hip",
  "ankle",
  "leg",
  "knee",
  "shoulder",
  "arm-elbow",
  "hand-wrist"
]);

export const careLocationSchema = z.enum(["CTMC", "BAS", "ER", "PCSL"]);

export const severitySchema = z.enum(["minimal", "moderate", "severe"]);

export const likelihoodSchema = z.enum([
  "Very High",
  "High",
  "Medium",
  "Low",
  "Very Low"
]);

export const decisionOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().optional()
});

export const decisionNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  question: z.string(),
  type: z.enum(["boolean", "select", "multiselect"]),
  category: z.enum([
    "red-flag",
    "history",
    "exam",
    "special-test",
    "severity",
    "follow-up"
  ]),
  evidencePage: z.number().int(),
  helpText: z.string().optional(),
  options: z.array(decisionOptionSchema).optional()
});

export const factValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string())
]);

export const factConditionSchema = z.object({
  fact: z.string(),
  operator: z.enum(["equals", "notEquals", "truthy", "falsy", "includes"]),
  value: factValueSchema.optional()
});

export const ruleConditionGroupSchema = z.object({
  all: z.array(factConditionSchema).optional(),
  any: z.array(factConditionSchema).optional(),
  none: z.array(factConditionSchema).optional()
});

export const redFlagRuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  when: ruleConditionGroupSchema,
  outcome: z.string(),
  urgency: z.enum([
    "today",
    "immediate",
    "72-hours",
    "7-10-days",
    "10-14-days",
    "routine"
  ]),
  emergency: z.boolean(),
  page: z.number().int(),
  citations: z.array(z.string()).min(1)
});

export const specialTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  positiveFinding: z.string(),
  page: z.number().int(),
  relatedDiagnoses: z.array(z.string())
});

export const imagingRuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  when: ruleConditionGroupSchema,
  orders: z.array(z.string()).min(1),
  rationale: z.string(),
  page: z.number().int(),
  citations: z.array(z.string()).min(1)
});

export const referralRuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  when: ruleConditionGroupSchema,
  disposition: z.string(),
  urgency: z.enum([
    "today",
    "immediate",
    "72-hours",
    "7-10-days",
    "10-14-days",
    "routine"
  ]),
  page: z.number().int(),
  citations: z.array(z.string()).min(1)
});

export const profileTemplateSchema = z.object({
  id: z.string(),
  severity: severitySchema,
  durationDays: z.number().int().positive(),
  commanderLimitations: z.array(z.string()).min(1),
  soldierInstructions: z.array(z.string()).min(1)
});

export const referenceEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  citation: z.string(),
  url: z.string().url().optional(),
  page: z.number().int(),
  bodyRegions: z.array(bodyRegionSchema).min(1)
});

export const sharedReferenceBlockSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  items: z.array(z.string()).min(1),
  page: z.number().int(),
  citations: z.array(z.string()).min(1)
});

export const conditionDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  icd10: z.string(),
  description: z.string(),
  likelihood: likelihoodSchema,
  severity: severitySchema,
  fallback: z.boolean().optional(),
  when: ruleConditionGroupSchema,
  disposition: z.string(),
  emergency: z.boolean(),
  emergencyReason: z.string().optional(),
  workup: z.array(z.string()),
  treatment: z.array(z.string()),
  profileTemplateId: z.string(),
  sharedBlockIds: z.array(z.string()).optional(),
  citations: z.array(z.string()).min(1)
});

export const intakePayloadSchema = z.object({
  bodyRegion: bodyRegionSchema,
  careLocation: careLocationSchema,
  chiefComplaint: z.string().min(5),
  vitals: z.string().default(""),
  physicalExam: z.string().default(""),
  pmh: z.string().default(""),
  allergies: z.string().default(""),
  meds: z.string().default(""),
  priorLabsImaging: z.string().default("")
});

export const pathwayDefinitionSchema = z.object({
  id: bodyRegionSchema,
  title: z.string(),
  summary: z.string(),
  bodyRegionLabel: z.string(),
  primaryPages: z.array(z.number().int()).min(1),
  referencePage: z.number().int(),
  sampleCase: intakePayloadSchema.partial(),
  decisionNodes: z.array(decisionNodeSchema).min(1),
  redFlags: z.array(redFlagRuleSchema),
  specialTests: z.array(specialTestSchema),
  imagingRules: z.array(imagingRuleSchema),
  referralRules: z.array(referralRuleSchema),
  profileTemplates: z.array(profileTemplateSchema).min(1),
  conditions: z.array(conditionDefinitionSchema).min(1),
  defaultDifferentials: z
    .array(
      z.object({
        name: z.string(),
        icd10: z.string(),
        description: z.string(),
        likelihood: likelihoodSchema
      })
    )
    .min(1)
});

export const answerSetSchema = z.record(z.string(), factValueSchema.optional());

export const questionSetSchema = z.object({
  pathway: pathwayDefinitionSchema,
  missingDecisionPoints: z.array(decisionNodeSchema),
  questions: z.array(decisionNodeSchema)
});

export const assessmentEntrySchema = z.object({
  name: z.string(),
  icd10: z.string(),
  desc: z.string(),
  likelihood: likelihoodSchema
});

export const planResponseSchema = z.object({
  subjective: z.object({
    hpiParagraph: z.string(),
    rosBullets: z.array(z.string())
  }),
  assessment: z.object({
    synthesisStatement: z.string(),
    ddx: z.array(assessmentEntrySchema)
  }),
  plan: z.object({
    disposition: z.string(),
    isEmergency: z.boolean(),
    emergencyReason: z.string().nullable(),
    workup: z.array(z.string()),
    treatment: z.array(z.string()),
    profile: z.object({
      days: z.number().int().positive(),
      commanderLimitations: z.array(z.string()),
      soldierInstructions: z.array(z.string())
    })
  }),
  trace: z.object({
    pathwayId: bodyRegionSchema,
    pathwayTitle: z.string(),
    matchedFacts: z.array(z.string()),
    redFlags: z.array(
      z.object({
        label: z.string(),
        detail: z.string(),
        page: z.number().int(),
        citations: z.array(z.string())
      })
    ),
    matchedConditions: z.array(
      z.object({
        label: z.string(),
        detail: z.string(),
        page: z.number().int(),
        citations: z.array(z.string())
      })
    ),
    imagingDecisions: z.array(
      z.object({
        label: z.string(),
        detail: z.string(),
        page: z.number().int(),
        citations: z.array(z.string())
      })
    ),
    referralDecisions: z.array(
      z.object({
        label: z.string(),
        detail: z.string(),
        page: z.number().int(),
        citations: z.array(z.string())
      })
    ),
    positiveSpecialTests: z.array(
      z.object({
        label: z.string(),
        detail: z.string(),
        page: z.number().int(),
        citations: z.array(z.string())
      })
    ),
    sharedGuidance: z.array(sharedReferenceBlockSchema)
  }),
  references: z.array(referenceEntrySchema),
  finalNoteDraft: z.string()
});

export const planRequestSchema = z.object({
  intake: intakePayloadSchema,
  answers: answerSetSchema
});

export const refineRequestSchema = z.object({
  caseContext: intakePayloadSchema,
  currentPlan: planResponseSchema,
  userQuestion: z.string().min(2)
});

export const refineResponseSchema = z.object({
  answer: z.string()
});
