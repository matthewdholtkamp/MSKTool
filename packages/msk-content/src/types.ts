export type BodyRegion =
  | "neck"
  | "hip"
  | "ankle"
  | "leg"
  | "knee"
  | "shoulder"
  | "arm-elbow"
  | "hand-wrist";

export type CareLocation = "CTMC" | "BAS" | "ER" | "PCSL";

export type Severity = "minimal" | "moderate" | "severe";

export type Likelihood = "Very High" | "High" | "Medium" | "Low" | "Very Low";

export type DecisionNodeType = "boolean" | "select" | "multiselect";

export type DecisionCategory =
  | "red-flag"
  | "history"
  | "exam"
  | "special-test"
  | "severity"
  | "follow-up";

export type RuleUrgency =
  | "today"
  | "immediate"
  | "72-hours"
  | "7-10-days"
  | "10-14-days"
  | "routine";

export type FactValue = string | number | boolean | string[];

export interface IntakePayload {
  bodyRegion: BodyRegion;
  careLocation: CareLocation;
  chiefComplaint: string;
  vitals: string;
  physicalExam: string;
  pmh: string;
  allergies: string;
  meds: string;
  priorLabsImaging: string;
}

export interface DecisionOption {
  label: string;
  value: string;
  description?: string;
}

export interface DecisionNode {
  id: string;
  label: string;
  question: string;
  type: DecisionNodeType;
  category: DecisionCategory;
  evidencePage: number;
  helpText?: string;
  options?: DecisionOption[];
}

export interface FactCondition {
  fact: string;
  operator: "equals" | "notEquals" | "truthy" | "falsy" | "includes";
  value?: FactValue;
}

export interface RuleConditionGroup {
  all?: FactCondition[];
  any?: FactCondition[];
  none?: FactCondition[];
}

export interface RedFlagRule {
  id: string;
  title: string;
  when: RuleConditionGroup;
  outcome: string;
  urgency: RuleUrgency;
  emergency: boolean;
  page: number;
  citations: string[];
}

export interface SpecialTest {
  id: string;
  name: string;
  positiveFinding: string;
  page: number;
  relatedDiagnoses: string[];
}

export interface ImagingRule {
  id: string;
  title: string;
  when: RuleConditionGroup;
  orders: string[];
  rationale: string;
  page: number;
  citations: string[];
}

export interface ReferralRule {
  id: string;
  title: string;
  when: RuleConditionGroup;
  disposition: string;
  urgency: RuleUrgency;
  page: number;
  citations: string[];
}

export interface ProfileTemplate {
  id: string;
  severity: Severity;
  durationDays: number;
  commanderLimitations: string[];
  soldierInstructions: string[];
}

export interface ReferenceEntry {
  id: string;
  title: string;
  citation: string;
  url?: string;
  page: number;
  bodyRegions: BodyRegion[];
}

export interface SharedReferenceBlock {
  id: string;
  title: string;
  summary: string;
  items: string[];
  page: number;
  citations: string[];
}

export interface ConditionDefinition {
  id: string;
  name: string;
  icd10: string;
  description: string;
  likelihood: Likelihood;
  severity: Severity;
  fallback?: boolean;
  when: RuleConditionGroup;
  disposition: string;
  emergency: boolean;
  emergencyReason?: string;
  workup: string[];
  treatment: string[];
  profileTemplateId: string;
  sharedBlockIds?: string[];
  citations: string[];
}

export interface PathwayDefinition {
  id: BodyRegion;
  title: string;
  summary: string;
  bodyRegionLabel: string;
  primaryPages: number[];
  referencePage: number;
  sampleCase: Partial<IntakePayload>;
  decisionNodes: DecisionNode[];
  redFlags: RedFlagRule[];
  specialTests: SpecialTest[];
  imagingRules: ImagingRule[];
  referralRules: ReferralRule[];
  profileTemplates: ProfileTemplate[];
  conditions: ConditionDefinition[];
  defaultDifferentials: Array<Pick<ConditionDefinition, "name" | "icd10" | "description" | "likelihood">>;
}

export type AnswerSet = Record<string, FactValue | undefined>;

export interface QuestionSet {
  pathway: PathwayDefinition;
  missingDecisionPoints: DecisionNode[];
  questions: DecisionNode[];
}

export interface SoapSubjective {
  hpiParagraph: string;
  rosBullets: string[];
}

export interface AssessmentEntry {
  name: string;
  icd10: string;
  desc: string;
  likelihood: Likelihood;
}

export interface SoapAssessment {
  synthesisStatement: string;
  ddx: AssessmentEntry[];
}

export interface SoapPlan {
  disposition: string;
  isEmergency: boolean;
  emergencyReason: string | null;
  workup: string[];
  treatment: string[];
  profile: {
    days: number;
    commanderLimitations: string[];
    soldierInstructions: string[];
  };
}

export interface TraceItem {
  label: string;
  detail: string;
  page: number;
  citations: string[];
}

export interface AlgorithmTrace {
  pathwayId: BodyRegion;
  pathwayTitle: string;
  matchedFacts: string[];
  redFlags: TraceItem[];
  matchedConditions: TraceItem[];
  imagingDecisions: TraceItem[];
  referralDecisions: TraceItem[];
  positiveSpecialTests: TraceItem[];
  sharedGuidance: SharedReferenceBlock[];
}

export interface PlanResponse {
  subjective: SoapSubjective;
  assessment: SoapAssessment;
  plan: SoapPlan;
  trace: AlgorithmTrace;
  references: ReferenceEntry[];
  finalNoteDraft: string;
}

export interface PlanRequest {
  intake: IntakePayload;
  answers: AnswerSet;
}

export interface RefineRequest {
  caseContext: IntakePayload;
  currentPlan: PlanResponse;
  userQuestion: string;
}

export interface RefineResponse {
  answer: string;
}
