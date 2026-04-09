import {
  pathwayDefinitionSchema,
  referenceEntrySchema,
  sharedReferenceBlockSchema
} from "./schemas";
import type {
  BodyRegion,
  DecisionNode,
  FactCondition,
  PathwayDefinition,
  ReferenceEntry,
  SharedReferenceBlock
} from "./types";

const pubmedUrl = (pmid: string) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

const yes = (fact: string): FactCondition => ({
  fact,
  operator: "equals",
  value: true
});

const no = (fact: string): FactCondition => ({
  fact,
  operator: "equals",
  value: false
});

const truthy = (fact: string): FactCondition => ({
  fact,
  operator: "truthy"
});

const boolNode = (
  id: string,
  label: string,
  question: string,
  evidencePage: number,
  category: DecisionNode["category"],
  helpText?: string
): DecisionNode => ({
  id,
  label,
  question,
  type: "boolean",
  category,
  evidencePage,
  helpText
});

const references: ReferenceEntry[] = [
  {
    id: "peace-love-2020",
    title: "Soft-tissue injuries simply need PEACE and LOVE",
    citation:
      "Dubois B, Esculier J. Br J Sports Med. 2020;54:72-73.",
    url: "https://bjsm.bmj.com/content/54/2/72",
    page: 17,
    bodyRegions: ["hip", "ankle", "leg", "knee", "shoulder", "arm-elbow", "hand-wrist"]
  },
  {
    id: "acr-msk-criteria",
    title: "American College of Radiology Appropriateness Criteria, Musculoskeletal Panel",
    citation: "American College of Radiology Appropriateness Criteria.",
    url: "https://www.acr.org/Clinical-Resources/ACR-Appropriateness-Criteria",
    page: 17,
    bodyRegions: ["neck", "hip", "ankle", "leg", "knee", "shoulder"]
  },
  {
    id: "neck-guideline-2017",
    title:
      "National clinical guidelines for non-surgical treatment of patients with recent onset neck pain or cervical radiculopathy",
    citation:
      "Kjaer P, et al. Eur Spine J. 2017 Sep;26(9):2242-2257. PMID: 28523381.",
    url: pubmedUrl("28523381"),
    page: 17,
    bodyRegions: ["neck"]
  },
  {
    id: "cspine-rule-2023",
    title:
      "Canadian C-spine Rule versus NEXUS in Screening of Clinically Important Traumatic Cervical Spine Injuries",
    citation:
      "Vazirizadeh-Mahabadi M, Yarahmadi M. Arch Acad Emerg Med. 2023;11(1):e5. PMID: 36620739.",
    url: pubmedUrl("36620739"),
    page: 17,
    bodyRegions: ["neck"]
  },
  {
    id: "hip-eular-2024",
    title:
      "EULAR recommendations for the non-pharmacological core management of hip and knee osteoarthritis: 2023 update",
    citation:
      "Moseng T, et al. Ann Rheum Dis. 2024;83(6):730-740. PMID: 38212040.",
    url: pubmedUrl("38212040"),
    page: 17,
    bodyRegions: ["hip", "knee"]
  },
  {
    id: "hip-zurich-2018",
    title:
      "Consensus recommendations on the classification, definition and diagnostic criteria of hip-related pain in young and middle-aged active adults",
    citation: "Reiman MP, et al. International Hip-related Pain Research Network, Zurich 2018.",
    page: 17,
    bodyRegions: ["hip"]
  },
  {
    id: "ankle-guideline-2022",
    title:
      "Management and treatment of ankle sprain according to clinical practice guidelines",
    citation:
      "Ruiz-Sanchez FJ, et al. Medicine (Baltimore). 2022;101(42):e31087. PMID: 36281183.",
    url: pubmedUrl("36281183"),
    page: 18,
    bodyRegions: ["ankle"]
  },
  {
    id: "ottawa-ankle-2017",
    title: "Diagnostic accuracy of the Ottawa Ankle and Midfoot Rules",
    citation:
      "Beckenkamp PR, et al. Br J Sports Med. 2017;51(6):504-510. PMID: 27884861.",
    url: pubmedUrl("27884861"),
    page: 18,
    bodyRegions: ["ankle"]
  },
  {
    id: "ankle-guideline-2024",
    title:
      "Evidence-based clinical practice guidelines for the management of acute ankle injuries",
    citation:
      "Bsoul N, et al. BMC Musculoskelet Disord. 2024;25(1):523. PMID: 38978052.",
    url: pubmedUrl("38978052"),
    page: 18,
    bodyRegions: ["ankle"]
  },
  {
    id: "leg-athlete-pain-2019",
    title:
      "Exercise-induced leg pain in athletes: diagnostic, assessment, and management strategies",
    citation:
      "Lohrer H, et al. Phys Sportsmed. 2019;47(1):47-59. PMID: 30345867.",
    url: pubmedUrl("30345867"),
    page: 18,
    bodyRegions: ["leg"]
  },
  {
    id: "dvt-diagnosis-2020",
    title:
      "Diagnosis of deep vein thrombosis of the lower extremity: a systematic review and meta-analysis of test accuracy",
    citation:
      "Bhatt M, et al. Blood Adv. 2020;4(7):1250-1264. PMID: 32227213.",
    url: pubmedUrl("32227213"),
    page: 18,
    bodyRegions: ["leg"]
  },
  {
    id: "knee-eval-2018",
    title: "Knee Pain in Adults and Adolescents: The Initial Evaluation",
    citation: "Bunt CW, et al. Am Fam Physician. 2018. PMID: 30325638.",
    url: pubmedUrl("30325638"),
    page: 19,
    bodyRegions: ["knee"]
  },
  {
    id: "ottawa-knee-2020",
    title:
      "Diagnostic accuracy of the Ottawa Knee Rule in adult acute knee injuries",
    citation:
      "Sims JI, et al. Eur Radiol. 2020;30(8):4438-4446. PMID: 32222797.",
    url: pubmedUrl("32222797"),
    page: 19,
    bodyRegions: ["knee"]
  },
  {
    id: "shoulder-injuries-2023",
    title: "Acute Shoulder Injuries in Adults",
    citation: "Simon LM, et al. Am Fam Physician. 2023. PMID: 37192075.",
    url: pubmedUrl("37192075"),
    page: 20,
    bodyRegions: ["shoulder"]
  },
  {
    id: "shoulder-acr-2025",
    title: "ACR Appropriateness Criteria Acute Shoulder Pain: 2024 Update",
    citation:
      "Laur O, et al. J Am Coll Radiol. 2025;22(5S):S36-S47. PMID: 40409888.",
    url: pubmedUrl("40409888"),
    page: 20,
    bodyRegions: ["shoulder"]
  },
  {
    id: "elbow-eval-2014",
    title: "Evaluation of elbow pain in adults",
    citation: "Kane SF, et al. Am Fam Physician. 2014. PMID: 24784124.",
    url: pubmedUrl("24784124"),
    page: 21,
    bodyRegions: ["arm-elbow"]
  },
  {
    id: "nerve-entrapment-2021",
    title: "Peripheral Nerve Entrapment and Injury in the Upper Extremity",
    citation: "Silver S, et al. Am Fam Physician. 2021. PMID: 33630556.",
    url: pubmedUrl("33630556"),
    page: 21,
    bodyRegions: ["arm-elbow", "hand-wrist"]
  },
  {
    id: "hand-ed-2025",
    title: "Diagnosing and managing hand and wrist injuries in the emergency department",
    citation:
      "Schmidt CL, et al. Emerg Med Pract. 2025;27(7):1-28. PMID: 40543086.",
    url: pubmedUrl("40543086"),
    page: 22,
    bodyRegions: ["hand-wrist"]
  },
  {
    id: "flexor-tenosynovitis-2017",
    title: "Flexor Tenosynovitis",
    citation:
      "Hyatt BT, Bagg MR. Orthop Clin North Am. 2017;48(2):217-227. PMID: 28336044.",
    url: pubmedUrl("28336044"),
    page: 22,
    bodyRegions: ["hand-wrist"]
  },
  {
    id: "cts-2016",
    title: "Carpal Tunnel Syndrome: Diagnosis and Management",
    citation:
      "Wipperman J, Goerl K. Am Fam Physician. 2016;94(12):993-999. PMID: 28075090.",
    url: pubmedUrl("28075090"),
    page: 22,
    bodyRegions: ["hand-wrist"]
  }
];

const sharedBlocks: SharedReferenceBlock[] = [
  {
    id: "weight-bearing-status",
    title: "Weight-Bearing Status With Crutches",
    summary: "Shared page 15 guidance on crutch language and expected load through the affected extremity.",
    items: [
      "NWB: 0% weight through the affected extremity.",
      "TTWB: toes may touch only for balance; no meaningful weight through the limb.",
      "PWB: partial weight bearing, typically 20-50% depending on the referring clinician.",
      "WBAT: weight bearing as tolerated, usually 50-100% based on pain and function.",
      "FWB: full body weight may be placed through the extremity."
    ],
    page: 15,
    citations: ["peace-love-2020"]
  },
  {
    id: "septic-crystal-warning",
    title: "Septic Arthritis and Crystal Arthropathy Screen",
    summary: "Shared page 15 red flag content for acutely inflamed joints.",
    items: [
      "Septic arthritis concerns: acute swelling, pain, erythema, warmth, immobility, fever, or recent infection.",
      "Crystal arthropathy concerns: acute pain/swelling within hours, difficulty weight bearing, and typical gout locations.",
      "Hold antibiotics until orthopedic discussion when the hand/wrist algorithm explicitly directs it.",
      "Escalate when fever, inability to bear weight, or constitutional symptoms are present."
    ],
    page: 15,
    citations: ["acr-msk-criteria"]
  },
  {
    id: "vascular-injury",
    title: "Hard and Soft Signs of Vascular Injury",
    summary: "Shared page 16 guidance for urgent vascular compromise decisions.",
    items: [
      "Hard signs: pulselessness, pallor, paresthesias, pain, paralysis, active arterial bleeding, thrill, or bruit.",
      "Soft signs: history of arterial bleeding, wound near a major artery, reduced pulse, or adjacent neurologic deficit.",
      "Hard signs require immediate operative or emergency-level evaluation."
    ],
    page: 16,
    citations: ["hand-ed-2025"]
  },
  {
    id: "nail-injury-management",
    title: "Nail Injury Support",
    summary: "Shared page 16 nail injury guidance for subungual hematoma and nail-bed trauma.",
    items: [
      "Subungual hematoma with severe pain may require decompression; large hematomas can require nail removal and nail-bed repair.",
      "Nail-bed lacerations or distal tip amputations should be referred to ortho or podiatry.",
      "Obtain finger or toe radiographs when fracture is a concern.",
      "Splinting and tetanus review should be considered when soft tissue injury is significant."
    ],
    page: 16,
    citations: ["hand-ed-2025"]
  }
];

const pathways: PathwayDefinition[] = [
  {
    id: "neck",
    title: "Traumatic and Acute Neck Pain",
    summary: "Use Canadian C-spine screening, red-flag review, and neurologic findings to separate routine strain from urgent cervical injury.",
    bodyRegionLabel: "Neck",
    primaryPages: [2],
    referencePage: 17,
    sampleCase: {
      bodyRegion: "neck",
      careLocation: "CTMC",
      chiefComplaint:
        "Adult soldier with acute neck pain after a hard landing during training, no identifiers included.",
      vitals: "BP 126/80, HR 84, RR 16, Temp 98.6F, SpO2 99%",
      physicalExam:
        "Pain with cervical rotation, midline tenderness absent, upper-extremity strength grossly intact.",
      pmh: "No prior cervical surgery.",
      allergies: "NKDA",
      meds: "None",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("history_red_flags", "History red flags", "Are any neck history red flags present: cancer, unexplained weight loss, immunocompromise, prolonged steroids, IV drug use, unexplained fever, bladder/bowel changes, significant trauma, dysphagia, headache/vomiting, Down syndrome, or rheumatoid arthritis?", 2, "red-flag"),
      boolNode("exam_red_flags", "Exam red flags", "Are there exam red flags such as spinal cord compression findings, vertebral tenderness, fever, severely limited ROM, or persistent neurologic findings?", 2, "red-flag"),
      boolNode("cspine_high_risk", "Canadian C-spine high-risk factor", "Is there a Canadian C-spine high-risk factor: age over 65, dangerous mechanism, or paresthesias in extremities?", 2, "history"),
      boolNode("cspine_low_risk", "Canadian C-spine low-risk factor", "Is there a low-risk factor allowing safe ROM assessment: simple rear-end MVC, sitting in waiting room, ambulatory at any time, delayed neck pain, or no midline tenderness?", 2, "history"),
      boolNode("can_rotate_45", "Active 45-degree rotation", "Can the patient actively rotate the neck 45 degrees left and right?", 2, "exam"),
      boolNode("neuro_symptoms", "Neurologic symptoms", "Are neurologic signs or radicular symptoms present?", 2, "exam"),
      boolNode("fracture_or_dislocation_on_xray", "Positive radiograph", "If radiographs were obtained, were they positive for fracture or dislocation?", 2, "history"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have neck symptoms persisted beyond the initial observation/profile period?", 2, "follow-up")
    ],
    redFlags: [
      {
        id: "neck-red-flags",
        title: "Urgent neck red flags",
        when: { any: [yes("history_red_flags"), yes("exam_red_flags")] },
        outcome:
          "Call Ortho, Neurosurgery, Neurology, or PM&R to discuss positive red flag findings.",
        urgency: "today",
        emergency: true,
        page: 2,
        citations: ["neck-guideline-2017", "cspine-rule-2023"]
      }
    ],
    specialTests: [
      {
        id: "neuro_symptoms",
        name: "Neurologic screen",
        positiveFinding: "Radicular symptoms or objective neurologic deficit",
        page: 2,
        relatedDiagnoses: ["cervical radiculopathy", "cervical spine injury"]
      }
    ],
    imagingRules: [
      {
        id: "neck-cspine-imaging",
        title: "Canadian C-spine imaging trigger",
        when: {
          any: [
            yes("cspine_high_risk"),
            no("cspine_low_risk"),
            no("can_rotate_45")
          ]
        },
        orders: ["Cervical spine X-ray: AP, lateral, and open-mouth views"],
        rationale: "Positive Canadian C-spine criteria or inability to rotate the neck warrants radiographs.",
        page: 2,
        citations: ["cspine-rule-2023", "acr-msk-criteria"]
      }
    ],
    referralRules: [
      {
        id: "neck-neuro-referral",
        title: "Persistent or neurologic neck symptoms",
        when: { any: [yes("neuro_symptoms"), yes("symptoms_persist")] },
        disposition: "Refer to PT, Sports Medicine, PM&R, or Orthopedics.",
        urgency: "7-10-days",
        page: 2,
        citations: ["neck-guideline-2017"]
      }
    ],
    profileTemplates: [
      {
        id: "neck-minimal",
        severity: "minimal",
        durationDays: 7,
        commanderLimitations: [
          "Duty-specific profile as needed",
          "No combatives or heavy lifting until pain-free",
          "Return to duty expected at end of profile"
        ],
        soldierInstructions: [
          "Use analgesics as needed per medication guidance page.",
          "Perform gentle ROM through comfort.",
          "Seek reevaluation sooner for worsening neurologic symptoms."
        ]
      },
      {
        id: "neck-moderate",
        severity: "moderate",
        durationDays: 10,
        commanderLimitations: [
          "No ruck marching or overhead lifting",
          "Avoid impact training and combatives",
          "Limit prolonged helmet or load-bearing tasks"
        ],
        soldierInstructions: [
          "Remove hard collar when directed and begin gentle motion.",
          "Use analgesics as needed.",
          "Follow up with PT, Sports Medicine, PM&R, or Orthopedics if symptoms persist."
        ]
      },
      {
        id: "neck-severe",
        severity: "severe",
        durationDays: 10,
        commanderLimitations: [
          "No field duty, weapons qualification, or driving tactical vehicles",
          "No lifting, rucking, or impact activity",
          "Hard collar or urgent specialist precautions if directed"
        ],
        soldierInstructions: [
          "Maintain immobilization precautions if ordered.",
          "Escalate immediately for weakness, gait changes, bowel/bladder symptoms, or worsening pain.",
          "Urgent specialty discussion is required before return to duty."
        ]
      }
    ],
    conditions: [
      {
        id: "neck-fracture",
        name: "Cervical fracture or dislocation",
        icd10: "S12.9XXA",
        description: "Positive cervical radiographs or unstable traumatic findings raise concern for fracture or dislocation.",
        likelihood: "Very High",
        severity: "severe",
        when: { all: [yes("fracture_or_dislocation_on_xray")] },
        disposition: "Urgent specialty management and immobilization.",
        emergency: true,
        emergencyReason: "Positive radiograph for cervical fracture or dislocation.",
        workup: ["Maintain cervical immobilization", "Cervical spine X-ray already positive; advanced imaging per specialist direction"],
        treatment: ["Hard collar", "Analgesic medications as needed", "Do not return to duty pending specialist guidance"],
        profileTemplateId: "neck-severe",
        citations: ["cspine-rule-2023", "acr-msk-criteria"]
      },
      {
        id: "neck-red-flag-condition",
        name: "Acute neck pain with red-flag findings",
        icd10: "M54.2",
        description: "History or exam red flags require urgent specialist discussion to exclude spinal cord compression, infection, or serious pathology.",
        likelihood: "High",
        severity: "severe",
        when: { any: [yes("history_red_flags"), yes("exam_red_flags")] },
        disposition: "Discuss with Ortho, Neurosurgery, Neurology, or PM&R today.",
        emergency: true,
        emergencyReason: "Serious neck pain red flags were identified.",
        workup: ["Urgent specialty consultation", "Cervical radiographs if not already obtained", "Consider advanced imaging per consultant"],
        treatment: ["Activity restriction", "Analgesic medications as needed", "Close neurologic monitoring"],
        profileTemplateId: "neck-severe",
        citations: ["neck-guideline-2017"]
      },
      {
        id: "neck-radiculopathy",
        name: "Cervical radiculopathy or neurologic irritation",
        icd10: "M54.12",
        description: "Neurologic symptoms increase concern for cervical radiculopathy or nerve root irritation.",
        likelihood: "High",
        severity: "moderate",
        when: { all: [yes("neuro_symptoms")] },
        disposition: "Outpatient management with referral if stable.",
        emergency: false,
        workup: ["Consider cervical radiographs if not yet obtained", "Focused neurologic reassessment at follow-up"],
        treatment: ["Analgesic medications as needed", "Gentle ROM as tolerated", "Referral to PT, Sports Medicine, PM&R, or Orthopedics"],
        profileTemplateId: "neck-moderate",
        citations: ["neck-guideline-2017"]
      },
      {
        id: "neck-strain-persistent",
        name: "Persistent cervical strain",
        icd10: "S16.1XXA",
        description: "Ongoing symptoms after the initial profile window support persistent cervical strain or sprain requiring follow-up.",
        likelihood: "Medium",
        severity: "moderate",
        when: { all: [yes("symptoms_persist")] },
        disposition: "Continue outpatient management and refer if not resolving.",
        emergency: false,
        workup: ["Consider cervical radiographs if still symptomatic", "Follow-up reassessment in 7-10 days"],
        treatment: ["Analgesic medications as needed", "Progressive ROM", "Referral to PT, Sports Medicine, PM&R, or Orthopedics"],
        profileTemplateId: "neck-moderate",
        citations: ["neck-guideline-2017", "peace-love-2020"]
      },
      {
        id: "neck-strain-fallback",
        name: "Acute cervical strain",
        icd10: "S16.1XXA",
        description: "Stable traumatic or acute neck pain without red flags is most consistent with cervical strain.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No immediate radiographs if Canadian C-spine screening is negative"],
        treatment: ["Analgesic medications as needed", "Gentle ROM and activity modification", "Return to duty anticipated at the end of profile"],
        profileTemplateId: "neck-minimal",
        citations: ["neck-guideline-2017", "cspine-rule-2023"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Acute cervical strain",
        icd10: "S16.1XXA",
        description: "Common after low-risk acute trauma without neurologic deficits.",
        likelihood: "Medium"
      },
      {
        name: "Cervical radiculopathy",
        icd10: "M54.12",
        description: "Consider when arm symptoms or neurologic findings accompany neck pain.",
        likelihood: "Low"
      }
    ]
  },
  {
    id: "hip",
    title: "Traumatic and Acute Hip Pain",
    summary: "Stratify urgent fracture, stress fracture, avascular necrosis, infection, and vascular injury before defaulting to soft-tissue or labral-type hip pain.",
    bodyRegionLabel: "Hip",
    primaryPages: [3, 4],
    referencePage: 17,
    sampleCase: {
      bodyRegion: "hip",
      careLocation: "BAS",
      chiefComplaint:
        "Acute right hip and groin pain after a run, pain with weight bearing, no identifiers included.",
      vitals: "BP 120/78, HR 76, RR 14, Temp 98.4F, SpO2 99%",
      physicalExam:
        "Antalgic gait, pain with internal rotation, no visible deformity.",
      pmh: "No known hip disease.",
      allergies: "NKDA",
      meds: "None",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("hip_imaging_positive", "Positive imaging or labs", "Are there positive findings on hip imaging or inflammatory lab work?", 3, "history"),
      boolNode("hip_special_tests_positive", "Positive hip special tests", "Are hip special tests positive, such as labral or fracture-supporting maneuvers from the algorithm page?", 3, "special-test"),
      boolNode("antalgic_gait", "Antalgic gait", "Is an antalgic gait present?", 3, "exam"),
      boolNode("fracture_suspected", "Fracture concern", "Is there concern for hip fracture based on trauma, deformity, or inability to tolerate load?", 3, "red-flag"),
      boolNode("stress_fracture_suspected", "Stress fracture concern", "Is stress fracture suspected due to weight-bearing pain, sudden increase in pre-existing pain, or painful internal rotation?", 3, "red-flag"),
      boolNode("avn_suspected", "AVN concern", "Is avascular necrosis suspected based on corticosteroid exposure, injections, excessive alcohol use, or persistent deep hip pain?", 3, "history"),
      boolNode("infection_or_septic_joint", "Infection or septic joint concern", "Are there signs of infection, septic joint, or inflammatory arthropathy in the hip?", 3, "red-flag"),
      boolNode("vascular_injury_signs", "Vascular injury signs", "Are hard or soft signs of vascular injury present?", 3, "red-flag"),
      boolNode("painful_internal_rotation", "Painful internal rotation", "Is hip ROM limited or painful, especially in internal rotation?", 3, "exam"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have hip symptoms persisted beyond the initial follow-up period?", 3, "follow-up")
    ],
    redFlags: [
      {
        id: "hip-urgent-fracture-infection-vascular",
        title: "Urgent hip red flags",
        when: {
          any: [
            yes("fracture_suspected"),
            yes("stress_fracture_suspected"),
            yes("infection_or_septic_joint"),
            yes("vascular_injury_signs"),
            yes("hip_imaging_positive")
          ]
        },
        outcome: "Obtain imaging/labs as indicated and discuss urgent positive findings with Orthopedics.",
        urgency: "today",
        emergency: true,
        page: 3,
        citations: ["hip-eular-2024", "acr-msk-criteria"]
      }
    ],
    specialTests: [
      {
        id: "hip_special_tests_positive",
        name: "Hip special tests",
        positiveFinding: "Positive provocative test consistent with fracture or labral pathology",
        page: 4,
        relatedDiagnoses: ["Hip labral injury", "Hip fracture"]
      }
    ],
    imagingRules: [
      {
        id: "hip-imaging-rule",
        title: "Hip imaging and lab guideline trigger",
        when: {
          any: [
            yes("fracture_suspected"),
            yes("stress_fracture_suspected"),
            yes("avn_suspected"),
            yes("infection_or_septic_joint"),
            yes("vascular_injury_signs")
          ]
        },
        orders: [
          "Plain radiographs of the hip",
          "MRI if occult fracture, AVN, or stress fracture remains suspected",
          "CBC, ESR, and CRP if arthropathy or infection is suspected"
        ],
        rationale: "The algorithm escalates fracture, AVN, stress fracture, and infectious patterns to imaging and lab evaluation.",
        page: 4,
        citations: ["acr-msk-criteria", "hip-eular-2024"]
      }
    ],
    referralRules: [
      {
        id: "hip-urgent-ortho",
        title: "Urgent orthopedic discussion",
        when: {
          any: [
            yes("hip_imaging_positive"),
            yes("fracture_suspected"),
            yes("stress_fracture_suspected"),
            yes("infection_or_septic_joint"),
            yes("vascular_injury_signs")
          ]
        },
        disposition: "Discuss with Orthopedics today.",
        urgency: "today",
        page: 3,
        citations: ["hip-eular-2024"]
      },
      {
        id: "hip-routine-follow-up",
        title: "Hip follow-up referral",
        when: { any: [yes("hip_special_tests_positive"), yes("symptoms_persist")] },
        disposition: "Re-evaluate by PCM and consider PT, Sports Medicine, PM&R, or Orthopedics.",
        urgency: "7-10-days",
        page: 3,
        citations: ["hip-zurich-2018"]
      }
    ],
    profileTemplates: [
      {
        id: "hip-minimal",
        severity: "minimal",
        durationDays: 7,
        commanderLimitations: [
          "No sprinting or loaded running",
          "Limit deep squatting and jumping",
          "Return to duty expected at end of profile"
        ],
        soldierInstructions: [
          "Use analgesics as needed.",
          "Relative rest with progressive motion as tolerated.",
          "Return sooner for worsening groin pain or inability to bear weight."
        ]
      },
      {
        id: "hip-moderate",
        severity: "moderate",
        durationDays: 10,
        commanderLimitations: [
          "No running, rucking, or impact training",
          "Use crutches if gait is antalgic",
          "Limit stairs and loaded movement"
        ],
        soldierInstructions: [
          "Use crutches WBAT if provided.",
          "Use analgesics as needed.",
          "Re-evaluate in 7-10 days if symptoms persist."
        ]
      },
      {
        id: "hip-severe",
        severity: "severe",
        durationDays: 10,
        commanderLimitations: [
          "No field duty, load bearing, or impact activity",
          "Crutches with TTWB or NWB if directed",
          "Await specialist clearance before return to duty"
        ],
        soldierInstructions: [
          "Protect weight bearing until urgent orthopedic guidance is complete.",
          "Escalate immediately for fever, inability to bear weight, or rapidly worsening pain.",
          "Follow imaging and lab instructions without delay."
        ]
      }
    ],
    conditions: [
      {
        id: "hip-fracture",
        name: "Hip fracture",
        icd10: "S72.009A",
        description: "Trauma with positive imaging, deformity, or inability to bear weight supports hip fracture.",
        likelihood: "Very High",
        severity: "severe",
        when: { any: [yes("hip_imaging_positive"), yes("fracture_suspected")] },
        disposition: "Discuss with Orthopedics today.",
        emergency: true,
        emergencyReason: "Hip fracture or other urgent structural injury is suspected.",
        workup: ["Hip radiographs", "MRI or CT if occult fracture remains suspected", "Urgent orthopedic discussion"],
        treatment: ["Crutches TTWB/NWB as directed", "Protective profile", "Analgesic medications as needed"],
        profileTemplateId: "hip-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["acr-msk-criteria", "hip-eular-2024"]
      },
      {
        id: "hip-stress-fracture",
        name: "Femoral neck or hip stress fracture",
        icd10: "M84.359A",
        description: "Weight-bearing pain, sudden pain progression, and painful internal rotation raise concern for stress fracture.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("stress_fracture_suspected")] },
        disposition: "Protect weight bearing and contact Orthopedics.",
        emergency: true,
        emergencyReason: "Hip stress fracture pattern has high displacement risk.",
        workup: ["Hip radiographs", "MRI if radiographs are normal or equivocal", "Urgent orthopedic discussion"],
        treatment: ["Crutches TTWB/NWB", "Analgesic medications as needed", "Severe profile with no impact activity"],
        profileTemplateId: "hip-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["acr-msk-criteria", "hip-eular-2024"]
      },
      {
        id: "hip-septic",
        name: "Septic hip or inflammatory arthropathy",
        icd10: "M00.9",
        description: "Acute painful hip with fever, recent infection, or inflammatory markers requires urgent workup.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("infection_or_septic_joint")] },
        disposition: "Urgent workup and orthopedic discussion.",
        emergency: true,
        emergencyReason: "Hip infection or septic joint concern is present.",
        workup: ["CBC, ESR, CRP", "Hip imaging", "Urgent orthopedic discussion"],
        treatment: ["Activity restriction", "Analgesic medications as needed", "Expedited escalation for fever or inability to bear weight"],
        profileTemplateId: "hip-severe",
        sharedBlockIds: ["septic-crystal-warning"],
        citations: ["acr-msk-criteria"]
      },
      {
        id: "hip-soft-tissue",
        name: "Acute hip soft-tissue or labral-pattern injury",
        icd10: "S76.019A",
        description: "Positive special tests or antalgic gait without urgent red flags supports labral or soft-tissue hip injury.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("hip_special_tests_positive"), yes("antalgic_gait"), yes("painful_internal_rotation")] },
        disposition: "Outpatient management with follow-up referral if symptoms persist.",
        emergency: false,
        workup: ["Consider hip imaging per guideline if symptoms persist", "PCM follow-up in 7-10 days"],
        treatment: ["Crutches if gait is antalgic", "Analgesic medications as needed", "Relative rest and progressive loading"],
        profileTemplateId: "hip-moderate",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["hip-zurich-2018", "peace-love-2020"]
      },
      {
        id: "hip-strain-fallback",
        name: "Acute hip strain",
        icd10: "S76.019A",
        description: "Stable acute hip pain without urgent features is most consistent with hip strain.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No immediate advanced imaging if symptoms are improving"],
        treatment: ["Analgesic medications as needed", "Relative rest", "Return to duty anticipated after short profile"],
        profileTemplateId: "hip-minimal",
        citations: ["peace-love-2020", "hip-eular-2024"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Hip labral injury",
        icd10: "S73.191A",
        description: "Consider with groin pain, clicking, catching, or positive impingement maneuvers.",
        likelihood: "Low"
      },
      {
        name: "Avascular necrosis of the hip",
        icd10: "M87.059",
        description: "Consider when steroid exposure or alcohol use accompanies persistent deep hip pain.",
        likelihood: "Low"
      }
    ]
  },
  {
    id: "ankle",
    title: "Traumatic and Acute Ankle Pain",
    summary: "Use Ottawa ankle rules and Achilles/infectious red flags to separate fracture, rupture, severe sprain, and mild ankle injury.",
    bodyRegionLabel: "Ankle",
    primaryPages: [5],
    referencePage: 18,
    sampleCase: {
      bodyRegion: "ankle",
      careLocation: "CTMC",
      chiefComplaint:
        "Rolled ankle during PT run this morning with immediate swelling and painful weight bearing.",
      vitals: "BP 124/78, HR 82, RR 16, Temp 98.4F, SpO2 98%",
      physicalExam:
        "Lateral ankle swelling, antalgic gait, tenderness near lateral malleolus.",
      pmh: "No prior ankle surgery.",
      allergies: "NKDA",
      meds: "None",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("ottawa_ankle_positive", "Ottawa ankle positive", "Does the Ottawa ankle rule trigger imaging: inability to bear weight for four steps or bony tenderness at the malleoli/navicular/base of fifth metatarsal?", 5, "history"),
      boolNode("deformity", "Deformity", "Is deformity present?", 5, "red-flag"),
      boolNode("fibular_head_tenderness", "Fibular head tenderness", "Is fibular head tenderness present?", 5, "exam"),
      boolNode("neurovascular_compromise", "Neurovascular compromise", "Is there neurovascular compromise in the foot or ankle?", 5, "red-flag"),
      boolNode("achilles_rupture_signs", "Achilles rupture signs", "Was there a pop, palpable posterior defect, positive Thompson test, or inability to rise on toes?", 5, "red-flag"),
      boolNode("infection_or_crystal", "Infection or crystal arthropathy", "Are there signs of infection, septic joint, or crystal-induced arthropathy?", 5, "red-flag"),
      boolNode("grade_two_or_more_sprain", "Grade II or greater sprain pattern", "Is there a grade II or greater sprain pattern based on instability, marked edema, antalgic gait, or significant ROM loss?", 5, "severity"),
      boolNode("antalgic_gait", "Antalgic gait", "Is an antalgic gait present?", 5, "exam"),
      boolNode("moderate_edema", "Moderate edema", "Is there moderate edema?", 5, "exam"),
      boolNode("limited_rom", "Limited ROM", "Is ankle ROM limited by pain or swelling?", 5, "exam"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have symptoms persisted beyond the first follow-up week?", 5, "follow-up")
    ],
    redFlags: [
      {
        id: "ankle-fracture-achilles-redflags",
        title: "Urgent ankle red flags",
        when: {
          any: [
            yes("deformity"),
            yes("neurovascular_compromise"),
            yes("achilles_rupture_signs"),
            yes("infection_or_crystal")
          ]
        },
        outcome: "Order imaging as indicated and call Orthopedics or Podiatry today to discuss management.",
        urgency: "today",
        emergency: true,
        page: 5,
        citations: ["ottawa-ankle-2017", "ankle-guideline-2024"]
      }
    ],
    specialTests: [
      {
        id: "achilles_rupture_signs",
        name: "Thompson/Achilles screen",
        positiveFinding: "Pop, palpable defect, positive Thompson test, or inability to toe rise",
        page: 5,
        relatedDiagnoses: ["Achilles tendon rupture"]
      }
    ],
    imagingRules: [
      {
        id: "ankle-ottawa-imaging",
        title: "Ottawa ankle imaging rule",
        when: { any: [yes("ottawa_ankle_positive"), yes("deformity"), yes("fibular_head_tenderness")] },
        orders: [
          "Ankle X-ray: AP, lateral, and mortise views",
          "If fibular head tenderness is present: AP/lateral knee plus tibia/fibula views"
        ],
        rationale: "Ottawa-positive injuries and proximal fibular tenderness warrant radiographs.",
        page: 5,
        citations: ["ottawa-ankle-2017", "acr-msk-criteria"]
      }
    ],
    referralRules: [
      {
        id: "ankle-severe-referral",
        title: "Severe ankle referral",
        when: { any: [yes("grade_two_or_more_sprain"), yes("achilles_rupture_signs")] },
        disposition: "PT, Sports Medicine, Podiatry, or Orthopedics within 24-72 hours.",
        urgency: "72-hours",
        page: 5,
        citations: ["ankle-guideline-2024", "ankle-guideline-2022"]
      },
      {
        id: "ankle-persistent-referral",
        title: "Persistent ankle symptoms",
        when: { any: [yes("symptoms_persist")] },
        disposition: "PT, Podiatry, Sports Medicine, or Orthopedics in 7-10 days.",
        urgency: "7-10-days",
        page: 5,
        citations: ["ankle-guideline-2022"]
      }
    ],
    profileTemplates: [
      {
        id: "ankle-minimal",
        severity: "minimal",
        durationDays: 7,
        commanderLimitations: [
          "No sprinting, jumping, or agility drills",
          "Brace or tape as needed during recovery",
          "Return to duty expected at end of profile"
        ],
        soldierInstructions: [
          "Use PEACE principles and encourage ROM.",
          "Analgesic medications as needed.",
          "Return sooner if swelling or inability to bear weight worsens."
        ]
      },
      {
        id: "ankle-moderate",
        severity: "moderate",
        durationDays: 10,
        commanderLimitations: [
          "No running, rucking, or impact training",
          "Use brace and WBAT crutches if gait is antalgic",
          "Avoid uneven terrain"
        ],
        soldierInstructions: [
          "Use PEACE principles and begin ROM early.",
          "Analgesic medications as needed.",
          "Re-evaluate in one week or sooner if instability worsens."
        ]
      },
      {
        id: "ankle-severe",
        severity: "severe",
        durationDays: 10,
        commanderLimitations: [
          "No field duty, impact activity, or load bearing beyond WBAT/TTWB instructions",
          "Crutches with protected weight bearing",
          "Await specialist clearance before return to duty"
        ],
        soldierInstructions: [
          "Use crutches as directed and protect the tendon or fracture pattern.",
          "Continue PEACE principles and analgesia.",
          "Urgent specialty follow-up is required."
        ]
      }
    ],
    conditions: [
      {
        id: "ankle-fracture",
        name: "Ankle fracture",
        icd10: "S82.899A",
        description: "Ottawa-positive injury with deformity or bony tenderness raises concern for fracture.",
        likelihood: "High",
        severity: "severe",
        when: { any: [yes("deformity"), yes("ottawa_ankle_positive"), yes("fibular_head_tenderness")] },
        disposition: "Order ankle radiographs and contact Orthopedics or Podiatry if fracture is confirmed or strongly suspected.",
        emergency: true,
        emergencyReason: "Fracture pattern cannot be excluded in an Ottawa-positive ankle injury.",
        workup: ["Ankle X-ray: AP, lateral, mortise", "Additional knee/tibia-fibula views if fibular head tenderness is present"],
        treatment: ["Profile severe", "Crutches WBAT or stricter as directed", "Analgesic medications as needed"],
        profileTemplateId: "ankle-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["ottawa-ankle-2017", "ankle-guideline-2024"]
      },
      {
        id: "ankle-achilles",
        name: "Achilles tendon rupture",
        icd10: "S86.011A",
        description: "A pop, palpable defect, positive Thompson test, or inability to toe rise supports Achilles rupture.",
        likelihood: "Very High",
        severity: "severe",
        when: { all: [yes("achilles_rupture_signs")] },
        disposition: "Urgent specialist discussion today.",
        emergency: true,
        emergencyReason: "Achilles rupture signs are present.",
        workup: ["Urgent specialty evaluation", "Consider imaging if specialist requests it"],
        treatment: ["Protected weight bearing", "Crutches", "Analgesic medications as needed"],
        profileTemplateId: "ankle-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["ankle-guideline-2024"]
      },
      {
        id: "ankle-septic",
        name: "Septic or crystal-induced ankle arthropathy",
        icd10: "M00.9",
        description: "Acute hot swollen ankle with fever or systemic inflammatory features requires escalation.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("infection_or_crystal")] },
        disposition: "Urgent escalation for infection or inflammatory joint workup.",
        emergency: true,
        emergencyReason: "Infection or crystal arthropathy concern is present.",
        workup: ["Urgent infection/inflammatory workup", "Consider ankle imaging and labs"],
        treatment: ["Activity restriction", "Analgesic medications as needed", "Do not treat as routine sprain"],
        profileTemplateId: "ankle-severe",
        sharedBlockIds: ["septic-crystal-warning"],
        citations: ["acr-msk-criteria"]
      },
      {
        id: "ankle-severe-sprain",
        name: "Grade II or greater ankle sprain",
        icd10: "S93.409A",
        description: "Instability, notable edema, antalgic gait, and ROM loss support a more severe sprain pattern.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("grade_two_or_more_sprain")] },
        disposition: "Protected outpatient management with early specialty or rehab follow-up.",
        emergency: false,
        workup: ["Consider ankle radiographs if not already obtained", "Close PCP follow-up and rehab referral"],
        treatment: ["Crutches WBAT", "PEACE and early ROM", "Analgesic medications as needed"],
        profileTemplateId: "ankle-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["ankle-guideline-2024", "ankle-guideline-2022", "peace-love-2020"]
      },
      {
        id: "ankle-grade-one",
        name: "Grade I ankle sprain",
        icd10: "S93.409A",
        description: "Pain with some motion loss or swelling but without severe instability is most consistent with a milder ankle sprain.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("antalgic_gait"), yes("moderate_edema"), yes("limited_rom")] },
        disposition: "Routine outpatient management with one-week reassessment.",
        emergency: false,
        workup: ["No advanced imaging if improving and Ottawa criteria are negative"],
        treatment: ["PEACE principles", "Encourage ROM", "Brace if instability complaints develop"],
        profileTemplateId: "ankle-moderate",
        citations: ["ankle-guideline-2022", "peace-love-2020"]
      },
      {
        id: "ankle-minor-fallback",
        name: "Minor ankle soft-tissue injury",
        icd10: "S93.409A",
        description: "Stable ankle pain without red flags is most consistent with a minor sprain or strain.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No imaging required if Ottawa criteria are negative and function is improving"],
        treatment: ["PEACE principles", "Analgesic medications as needed", "Return to duty anticipated after brief profile"],
        profileTemplateId: "ankle-minimal",
        citations: ["ankle-guideline-2022", "ottawa-ankle-2017"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Peroneal tendon irritation",
        icd10: "M76.71",
        description: "Consider when lateral ankle pain persists despite negative fracture screening.",
        likelihood: "Low"
      },
      {
        name: "Syndesmotic sprain",
        icd10: "S93.431A",
        description: "Consider with pain above the ankle joint or persistent instability.",
        likelihood: "Low"
      }
    ]
  },
  {
    id: "leg",
    title: "Traumatic and Acute Leg Pain",
    summary: "Rule out compartment syndrome, fracture, DVT, infection, vascular injury, and Achilles rupture before treating routine overuse or shin pain.",
    bodyRegionLabel: "Leg",
    primaryPages: [6],
    referencePage: 18,
    sampleCase: {
      bodyRegion: "leg",
      careLocation: "BAS",
      chiefComplaint:
        "Acute lower-leg pain after increased running volume, focal tibial tenderness, no identifiers included.",
      vitals: "BP 118/72, HR 74, RR 14, Temp 98.1F, SpO2 99%",
      physicalExam:
        "Focal tibial tenderness, mild antalgic gait, calf soft, distal pulses intact.",
      pmh: "No clotting history.",
      allergies: "NKDA",
      meds: "None",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("compartment_syndrome_signs", "Compartment syndrome signs", "Is there pain out of proportion, paresthesias, tightness/fullness, stretch pain, crush/blunt trauma, or anticoagulation-associated concern for compartment syndrome?", 6, "red-flag"),
      boolNode("achilles_rupture_signs", "Achilles rupture signs", "Is Achilles rupture suspected from pop, defect, positive Thompson test, or inability to toe rise?", 6, "red-flag"),
      boolNode("fracture_signs", "Fracture signs", "Is fracture suspected from trauma, deformity, or focal bony tenderness?", 6, "red-flag"),
      boolNode("dvt_concern", "DVT concern", "Is DVT a concern due to calf pain/swelling, warmth, venous distention, or concerning Wells features?", 6, "red-flag"),
      boolNode("cellulitis_or_infection", "Cellulitis or infection", "Are redness, warmth, swelling, fever, or streaking present?", 6, "red-flag"),
      boolNode("vascular_injury_signs", "Vascular injury signs", "Are hard or soft signs of vascular injury present?", 6, "red-flag"),
      boolNode("antalgic_gait", "Antalgic gait", "Is an antalgic gait present?", 6, "exam"),
      boolNode("focal_tenderness", "Focal tenderness", "Is focal leg tenderness present?", 6, "exam"),
      boolNode("hop_test_positive", "Hop test positive", "Is the hop test positive or poorly tolerated?", 6, "special-test"),
      boolNode("exercise_paresthesia", "Exercise pain or paresthesia", "Are exercise-related pain or paresthesias present?", 6, "history"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have symptoms persisted after the initial 1-2 week follow-up?", 6, "follow-up")
    ],
    redFlags: [
      {
        id: "leg-redflags",
        title: "Urgent leg red flags",
        when: {
          any: [
            yes("compartment_syndrome_signs"),
            yes("fracture_signs"),
            yes("dvt_concern"),
            yes("cellulitis_or_infection"),
            yes("vascular_injury_signs"),
            yes("achilles_rupture_signs")
          ]
        },
        outcome: "Order indicated imaging or Doppler and call the relevant specialty or ER today.",
        urgency: "today",
        emergency: true,
        page: 6,
        citations: ["leg-athlete-pain-2019", "dvt-diagnosis-2020"]
      }
    ],
    specialTests: [
      {
        id: "hop_test_positive",
        name: "Hop test",
        positiveFinding: "Pain with impact suggests stress injury",
        page: 6,
        relatedDiagnoses: ["Stress fracture", "Medial tibial stress syndrome"]
      }
    ],
    imagingRules: [
      {
        id: "leg-fracture-imaging",
        title: "Leg radiograph trigger",
        when: { any: [yes("fracture_signs"), yes("focal_tenderness"), yes("hop_test_positive")] },
        orders: ["Leg X-ray: AP and lateral views", "Consider bone scan or advanced imaging if stress fracture remains suspected"],
        rationale: "Suspected fracture or stress injury warrants radiographs and possibly further imaging.",
        page: 6,
        citations: ["acr-msk-criteria", "leg-athlete-pain-2019"]
      }
    ],
    referralRules: [
      {
        id: "leg-severe-referral",
        title: "Severe leg referral",
        when: { any: [yes("fracture_signs"), yes("achilles_rupture_signs")] },
        disposition: "PT, Podiatry, Sports Medicine, or Orthopedics within 24-72 hours.",
        urgency: "72-hours",
        page: 6,
        citations: ["leg-athlete-pain-2019"]
      },
      {
        id: "leg-persistent-referral",
        title: "Persistent leg symptoms",
        when: { any: [yes("symptoms_persist")] },
        disposition: "PT, Sports Medicine, or Orthopedics in 7-10 days.",
        urgency: "7-10-days",
        page: 6,
        citations: ["leg-athlete-pain-2019"]
      }
    ],
    profileTemplates: [
      {
        id: "leg-minimal",
        severity: "minimal",
        durationDays: 7,
        commanderLimitations: [
          "No sprinting or repeated impact loading",
          "Limit running mileage",
          "Return to duty expected after short profile"
        ],
        soldierInstructions: [
          "Use PEACE principles and progressive stretching.",
          "Analgesic medications as needed.",
          "Return sooner for calf swelling, numbness, or worsening pain."
        ]
      },
      {
        id: "leg-moderate",
        severity: "moderate",
        durationDays: 14,
        commanderLimitations: [
          "No running, rucking, or jumping",
          "Crutches WBAT as needed",
          "Avoid forced marching"
        ],
        soldierInstructions: [
          "Use PEACE and gradual ROM/stretching.",
          "Analgesic medications as needed.",
          "Reassess within 1-2 weeks."
        ]
      },
      {
        id: "leg-severe",
        severity: "severe",
        durationDays: 10,
        commanderLimitations: [
          "No field duty or impact training",
          "Protected weight bearing with crutches",
          "Await specialist or emergency clearance before return to duty"
        ],
        soldierInstructions: [
          "Escalate immediately for worsening numbness, tense swelling, or calf redness/warmth.",
          "Use crutches as directed.",
          "Urgent follow-up is required."
        ]
      }
    ],
    conditions: [
      {
        id: "leg-compartment",
        name: "Acute compartment syndrome concern",
        icd10: "T79.A29A",
        description: "Pain out of proportion with tense compartments or neurologic symptoms is limb-threatening.",
        likelihood: "Very High",
        severity: "severe",
        when: { all: [yes("compartment_syndrome_signs")] },
        disposition: "Immediate emergency escalation.",
        emergency: true,
        emergencyReason: "Compartment syndrome features were reported.",
        workup: ["Emergency evaluation", "Urgent surgical/orthopedic consultation"],
        treatment: ["Do not treat as routine overuse pain", "Maintain limb precautions", "Urgent transfer if not already in ER"],
        profileTemplateId: "leg-severe",
        citations: ["leg-athlete-pain-2019"]
      },
      {
        id: "leg-dvt",
        name: "Deep vein thrombosis concern",
        icd10: "I82.409",
        description: "Calf pain/swelling with warmth or venous distention warrants Doppler workup for DVT.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("dvt_concern")] },
        disposition: "Call medicine or ER and obtain Doppler ultrasound.",
        emergency: true,
        emergencyReason: "Potential DVT was identified in the leg pathway.",
        workup: ["Doppler ultrasound", "Medicine/ER discussion"],
        treatment: ["Activity restriction", "Do not manage as routine shin pain until DVT is excluded"],
        profileTemplateId: "leg-severe",
        citations: ["dvt-diagnosis-2020"]
      },
      {
        id: "leg-fracture-stress",
        name: "Leg fracture or stress fracture",
        icd10: "M84.369A",
        description: "Trauma, focal tenderness, or positive hop testing raises concern for fracture or stress injury.",
        likelihood: "High",
        severity: "severe",
        when: { any: [yes("fracture_signs"), yes("hop_test_positive")] },
        disposition: "Protect weight bearing and obtain imaging.",
        emergency: true,
        emergencyReason: "Leg fracture or stress fracture pattern is present.",
        workup: ["Leg X-ray: AP and lateral", "Consider bone scan or advanced imaging if needed"],
        treatment: ["Crutches WBAT or stricter", "Analgesic medications as needed", "Severe profile"],
        profileTemplateId: "leg-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["leg-athlete-pain-2019", "acr-msk-criteria"]
      },
      {
        id: "leg-infection",
        name: "Cellulitis or other leg infection",
        icd10: "L03.119",
        description: "Redness, warmth, swelling, or fever indicates infectious rather than purely musculoskeletal pathology.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("cellulitis_or_infection")] },
        disposition: "Call Medicine/ER or Orthopedics based on severity.",
        emergency: true,
        emergencyReason: "Leg infection or cellulitis features are present.",
        workup: ["Urgent infectious workup", "Escalate out of routine musculoskeletal pathway"],
        treatment: ["Activity restriction", "Urgent clinical reassessment"],
        profileTemplateId: "leg-severe",
        citations: ["dvt-diagnosis-2020"]
      },
      {
        id: "leg-achilles",
        name: "Achilles tendon rupture or severe tendinopathy",
        icd10: "S86.011A",
        description: "Posterior leg pop or positive Thompson testing supports Achilles injury.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("achilles_rupture_signs")] },
        disposition: "Urgent specialist follow-up.",
        emergency: true,
        emergencyReason: "Achilles rupture signs are present in the leg pathway.",
        workup: ["Urgent specialty evaluation"],
        treatment: ["Crutches WBAT", "PEACE principles", "Analgesic medications as needed"],
        profileTemplateId: "leg-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["leg-athlete-pain-2019"]
      },
      {
        id: "leg-overuse",
        name: "Medial tibial stress syndrome or overuse leg pain",
        icd10: "M79.669",
        description: "Exercise-related pain with focal tenderness and no red flags supports overuse leg pain.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("antalgic_gait"), yes("focal_tenderness"), yes("exercise_paresthesia")] },
        disposition: "Outpatient management with follow-up and imaging if symptoms persist.",
        emergency: false,
        workup: ["Consider leg X-rays if symptoms persist or worsen", "Follow-up in 1-2 weeks"],
        treatment: ["PEACE principles", "ROM/stretching", "Analgesic medications as needed"],
        profileTemplateId: "leg-moderate",
        citations: ["leg-athlete-pain-2019", "peace-love-2020"]
      },
      {
        id: "leg-fallback",
        name: "Mild leg strain or shin pain",
        icd10: "M79.669",
        description: "Stable lower-leg pain without urgent features can be managed conservatively.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No immediate imaging if symptoms are mild and improving"],
        treatment: ["Analgesic medications as needed", "Progressive stretching and activity reduction"],
        profileTemplateId: "leg-minimal",
        citations: ["leg-athlete-pain-2019", "peace-love-2020"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Exercise-induced lower-leg pain",
        icd10: "M79.669",
        description: "Consider chronic exertional causes when symptoms are tightly exercise-linked.",
        likelihood: "Low"
      },
      {
        name: "Achilles tendinopathy",
        icd10: "M76.60",
        description: "Consider when posterior leg pain occurs without rupture features.",
        likelihood: "Low"
      }
    ]
  },
  {
    id: "knee",
    title: "Traumatic and Acute Knee Pain",
    summary: "Use Ottawa knee rules, extensor mechanism screening, and instability findings to separate fracture, dislocation, internal derangement, and mild knee injury.",
    bodyRegionLabel: "Knee",
    primaryPages: [7, 8],
    referencePage: 19,
    sampleCase: {
      bodyRegion: "knee",
      careLocation: "PCSL",
      chiefComplaint:
        "Acute knee pain after pivoting injury during training with swelling and limited ROM.",
      vitals: "BP 122/76, HR 80, RR 16, Temp 98.2F, SpO2 99%",
      physicalExam:
        "Effusion present, ROM painful, mild instability subjectively reported.",
      pmh: "No prior ligament surgery.",
      allergies: "NKDA",
      meds: "Ibuprofen PRN",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("ottawa_knee_positive", "Ottawa knee positive", "Does the Ottawa knee rule trigger imaging: age >55, fibular head tenderness, isolated patellar tenderness, inability to flex >90 degrees, or inability to walk four steps?", 7, "history"),
      boolNode("deformity", "Deformity", "Is deformity present?", 7, "red-flag"),
      boolNode("locked_knee", "Locked knee", "Is the knee locked or unable to move through 10-90 degrees?", 7, "red-flag"),
      boolNode("tense_effusion_4h", "Rapid tense effusion", "Did a tense effusion develop within four hours?", 7, "exam"),
      boolNode("straight_leg_raise_unable", "Cannot perform straight leg raise", "Is the patient unable to perform a straight leg raise or maintain full active extension?", 7, "red-flag"),
      boolNode("neurovascular_injury", "Neurovascular injury", "Is there altered circulation, temperature, motor, or sensory function?", 7, "red-flag"),
      boolNode("infection_or_crystal", "Infection or crystal arthropathy", "Are there signs of septic or crystal-induced arthritis?", 7, "red-flag"),
      boolNode("ligament_instability", "Ligament instability", "Are instability maneuvers positive or is gross ligament instability present?", 7, "special-test"),
      boolNode("patellar_apprehension", "Patellar apprehension", "Is the patellar apprehension test positive?", 7, "special-test"),
      boolNode("effusion_or_edema", "Effusion or edema", "Is effusion or edema present?", 7, "exam"),
      boolNode("decreased_rom", "Decreased ROM", "Is ROM decreased due to pain or swelling?", 7, "exam"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have symptoms persisted after the profile period?", 7, "follow-up")
    ],
    redFlags: [
      {
        id: "knee-redflags",
        title: "Urgent knee red flags",
        when: {
          any: [
            yes("deformity"),
            yes("ottawa_knee_positive"),
            yes("locked_knee"),
            yes("straight_leg_raise_unable"),
            yes("neurovascular_injury"),
            yes("infection_or_crystal")
          ]
        },
        outcome: "Order AP/lateral knee radiographs and call Orthopedics today when fracture, dislocation, extensor rupture, or neurovascular compromise is suspected.",
        urgency: "today",
        emergency: true,
        page: 7,
        citations: ["ottawa-knee-2020", "knee-eval-2018"]
      }
    ],
    specialTests: [
      {
        id: "ligament_instability",
        name: "Knee ligament instability tests",
        positiveFinding: "Positive Lachman, posterior drawer, valgus, or varus stress testing",
        page: 8,
        relatedDiagnoses: ["ACL/PCL injury", "Collateral ligament injury"]
      },
      {
        id: "patellar_apprehension",
        name: "Patellar apprehension",
        positiveFinding: "Apprehension or guarding with lateral patellar translation",
        page: 8,
        relatedDiagnoses: ["Patellar instability or dislocation"]
      }
    ],
    imagingRules: [
      {
        id: "knee-ottawa-imaging",
        title: "Ottawa knee imaging rule",
        when: { any: [yes("ottawa_knee_positive"), yes("deformity")] },
        orders: ["Knee X-ray: AP and lateral views", "If fibular head tenderness is present, add tibia/fibula views"],
        rationale: "Ottawa-positive or visibly deformed knees warrant radiographs.",
        page: 7,
        citations: ["ottawa-knee-2020", "acr-msk-criteria"]
      }
    ],
    referralRules: [
      {
        id: "knee-severe-referral",
        title: "Severe knee referral",
        when: { any: [yes("ligament_instability"), yes("patellar_apprehension"), yes("straight_leg_raise_unable")] },
        disposition: "PT, Sports Medicine, or Orthopedics within 72 hours.",
        urgency: "72-hours",
        page: 7,
        citations: ["knee-eval-2018"]
      }
    ],
    profileTemplates: [
      {
        id: "knee-minimal",
        severity: "minimal",
        durationDays: 7,
        commanderLimitations: [
          "No sprinting, cutting, or jumping",
          "Progressive return to duty if pain continues to improve",
          "Return to duty expected at end of profile"
        ],
        soldierInstructions: [
          "Use PEACE principles and analgesics as needed.",
          "Avoid sleeping with the knee propped in flexion.",
          "Return sooner for instability or swelling progression."
        ]
      },
      {
        id: "knee-moderate",
        severity: "moderate",
        durationDays: 14,
        commanderLimitations: [
          "No running, rucking, or kneeling drills",
          "Crutches WBAT as needed",
          "Avoid pivoting and lateral cutting"
        ],
        soldierInstructions: [
          "Use PEACE principles.",
          "Analgesic medications as needed.",
          "Follow up at the end of profile."
        ]
      },
      {
        id: "knee-severe",
        severity: "severe",
        durationDays: 10,
        commanderLimitations: [
          "No field duty, impact training, or loaded marching",
          "Crutches WBAT and hinged knee brace if unstable",
          "Await specialist clearance before return to duty"
        ],
        soldierInstructions: [
          "Use brace settings as directed and avoid sleeping with the knee flexed over a pillow.",
          "Use PEACE principles and analgesics as needed.",
          "Urgent specialist follow-up is required."
        ]
      }
    ],
    conditions: [
      {
        id: "knee-fracture",
        name: "Knee fracture or dislocation concern",
        icd10: "S82.90XA",
        description: "Ottawa-positive trauma, deformity, or inability to bear weight raises concern for fracture or dislocation.",
        likelihood: "High",
        severity: "severe",
        when: { any: [yes("deformity"), yes("ottawa_knee_positive"), yes("neurovascular_injury")] },
        disposition: "Order radiographs and call Orthopedics today.",
        emergency: true,
        emergencyReason: "Potential knee fracture, dislocation, or neurovascular injury.",
        workup: ["Knee X-ray: AP and lateral", "Additional tibia/fibula views if fibular head tenderness is present"],
        treatment: ["Crutches WBAT", "Brace if unstable", "Analgesic medications as needed"],
        profileTemplateId: "knee-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["ottawa-knee-2020", "knee-eval-2018"]
      },
      {
        id: "knee-extensor",
        name: "Patellar or quadriceps tendon rupture",
        icd10: "S76.119A",
        description: "Inability to perform straight leg raise or maintain active extension is concerning for extensor mechanism rupture.",
        likelihood: "Very High",
        severity: "severe",
        when: { all: [yes("straight_leg_raise_unable")] },
        disposition: "Urgent orthopedic management.",
        emergency: true,
        emergencyReason: "Extensor mechanism rupture cannot be excluded.",
        workup: ["Knee X-ray: AP and lateral", "Urgent orthopedic discussion"],
        treatment: ["Brace and protected WBAT", "Analgesic medications as needed", "No return to duty pending specialist review"],
        profileTemplateId: "knee-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["knee-eval-2018"]
      },
      {
        id: "knee-septic",
        name: "Septic or crystal-induced knee arthropathy",
        icd10: "M00.9",
        description: "Hot swollen knee with fever or constitutional symptoms warrants urgent escalation.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("infection_or_crystal")] },
        disposition: "Urgent infection/inflammatory workup.",
        emergency: true,
        emergencyReason: "Septic or crystal arthropathy concern is present in the knee pathway.",
        workup: ["Urgent joint evaluation", "Inflammatory/infectious lab work as indicated"],
        treatment: ["Do not manage as routine sprain", "Activity restriction"],
        profileTemplateId: "knee-severe",
        sharedBlockIds: ["septic-crystal-warning"],
        citations: ["acr-msk-criteria"]
      },
      {
        id: "knee-ligamentous",
        name: "Acute ligamentous internal derangement",
        icd10: "S83.519A",
        description: "Positive instability tests, rapid effusion, or locking suggest ACL/PCL/collateral injury or internal derangement.",
        likelihood: "High",
        severity: "severe",
        when: { any: [yes("ligament_instability"), yes("locked_knee"), yes("tense_effusion_4h")] },
        disposition: "Severe outpatient management with expedited specialty follow-up.",
        emergency: false,
        workup: ["Knee X-ray: AP and lateral", "MRI not indicated acutely per algorithm"],
        treatment: ["Crutches WBAT", "Hinged knee brace if unstable", "PEACE principles"],
        profileTemplateId: "knee-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["knee-eval-2018", "peace-love-2020"]
      },
      {
        id: "knee-patellar",
        name: "Patellar instability or dislocation pattern",
        icd10: "S83.005A",
        description: "Positive patellar apprehension suggests patellar instability or recent dislocation.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("patellar_apprehension")] },
        disposition: "Severe outpatient management with early specialty follow-up.",
        emergency: false,
        workup: ["Knee radiographs", "Brace if unstable"],
        treatment: ["Crutches WBAT", "Hinged brace with protective ROM", "PEACE principles"],
        profileTemplateId: "knee-severe",
        sharedBlockIds: ["weight-bearing-status"],
        citations: ["knee-eval-2018"]
      },
      {
        id: "knee-sprain",
        name: "Acute knee sprain or contusion",
        icd10: "S83.90XA",
        description: "Painful ROM and effusion without urgent structural signs support moderate knee sprain.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("effusion_or_edema"), yes("decreased_rom"), yes("symptoms_persist")] },
        disposition: "Routine outpatient management with reassessment.",
        emergency: false,
        workup: ["Consider radiographs if not already obtained"],
        treatment: ["Crutches PRN WBAT", "PEACE principles", "Analgesic medications as needed"],
        profileTemplateId: "knee-moderate",
        citations: ["knee-eval-2018", "peace-love-2020"]
      },
      {
        id: "knee-fallback",
        name: "Minor knee soft-tissue injury",
        icd10: "S83.90XA",
        description: "Stable knee pain without red flags is most consistent with minor soft-tissue injury.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No immediate imaging if Ottawa criteria are negative and function is improving"],
        treatment: ["Analgesic medications as needed", "PEACE principles", "Progressive activity return"],
        profileTemplateId: "knee-minimal",
        citations: ["knee-eval-2018", "ottawa-knee-2020"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Meniscal injury",
        icd10: "S83.209A",
        description: "Consider when joint-line pain, locking, or clicking is present.",
        likelihood: "Low"
      },
      {
        name: "Patellofemoral pain flare",
        icd10: "M22.2X9",
        description: "Consider in anterior knee pain without gross instability or fracture concern.",
        likelihood: "Low"
      }
    ]
  },
  {
    id: "shoulder",
    title: "Traumatic and Acute Shoulder Pain",
    summary: "Separate fracture/dislocation, neurovascular injury, septic shoulder, cervical referral, instability, rotator cuff injury, and AC injury with algorithm-directed exam findings.",
    bodyRegionLabel: "Shoulder",
    primaryPages: [9, 10, 11],
    referencePage: 20,
    sampleCase: {
      bodyRegion: "shoulder",
      careLocation: "CTMC",
      chiefComplaint:
        "Acute right shoulder pain after fall onto the shoulder with painful overhead motion.",
      vitals: "BP 128/80, HR 78, RR 16, Temp 98.5F, SpO2 99%",
      physicalExam:
        "Painful active ROM, tenderness over AC region, no distal pulse deficit.",
      pmh: "No prior shoulder dislocation.",
      allergies: "NKDA",
      meds: "None",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("deformity", "Deformity or unwillingness to move", "Is there deformity or unwillingness to move the shoulder because of pain?", 9, "red-flag"),
      boolNode("neurovascular_injury", "Neurovascular injury", "Is there altered circulation, temperature, motor, or sensory function?", 9, "red-flag"),
      boolNode("infection_or_septic_joint", "Infection or septic joint", "Are there signs of septic shoulder or exudative infection?", 9, "red-flag"),
      boolNode("uncertain_exam", "Uncertain exam", "Is the exam inconclusive, pain out of proportion, or unable to reproduce symptoms mechanically?", 9, "red-flag"),
      boolNode("cervical_spine_pain", "Cervical pain pattern", "Does the presentation fit cervical spine pain and require the neck pathway?", 9, "history"),
      boolNode("instability_tests_positive", "Anterior instability tests positive", "Are the Apprehension and Relocation tests positive?", 9, "special-test"),
      boolNode("rotator_cuff_tests_positive", "Rotator cuff tests positive", "Are external rotation lag, belly press, lift-off, drop sign, Hawkins, or Neer tests positive?", 9, "special-test"),
      boolNode("ac_joint_tests_positive", "AC joint tests positive", "Are cross-body adduction, AC resisted extension, O'Brien, or AC palpation tests positive?", 9, "special-test"),
      boolNode("decreased_rom", "Painful or decreased ROM", "Is ROM painful throughout or limited?", 9, "exam"),
      boolNode("decreased_strength", "Decreased shoulder strength", "Is shoulder or arm strength decreased?", 9, "exam"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have symptoms persisted beyond the profile window?", 9, "follow-up")
    ],
    redFlags: [
      {
        id: "shoulder-redflags",
        title: "Urgent shoulder red flags",
        when: {
          any: [
            yes("deformity"),
            yes("neurovascular_injury"),
            yes("infection_or_septic_joint"),
            yes("uncertain_exam")
          ]
        },
        outcome: "Obtain AP/lateral/axillary shoulder radiographs and call Orthopedics today when major injury or neurovascular compromise is suspected.",
        urgency: "today",
        emergency: true,
        page: 9,
        citations: ["shoulder-injuries-2023", "shoulder-acr-2025"]
      }
    ],
    specialTests: [
      {
        id: "instability_tests_positive",
        name: "Apprehension and relocation tests",
        positiveFinding: "Pain/apprehension reduced with relocation support",
        page: 10,
        relatedDiagnoses: ["Anterior shoulder instability", "Labral injury"]
      },
      {
        id: "rotator_cuff_tests_positive",
        name: "Rotator cuff cluster",
        positiveFinding: "Positive lag sign, belly press, lift-off, drop sign, Hawkins, or Neer test",
        page: 10,
        relatedDiagnoses: ["Rotator cuff tear or impingement"]
      },
      {
        id: "ac_joint_tests_positive",
        name: "AC joint cluster",
        positiveFinding: "Positive AC provocation or painful palpation at the AC joint",
        page: 11,
        relatedDiagnoses: ["AC joint sprain"]
      }
    ],
    imagingRules: [
      {
        id: "shoulder-imaging-rule",
        title: "Acute shoulder imaging rule",
        when: { any: [yes("deformity"), yes("instability_tests_positive"), yes("ac_joint_tests_positive")] },
        orders: ["Shoulder X-ray: AP, lateral, and axillary views", "Add AC series when AC injury is suspected"],
        rationale: "The algorithm calls for routine acute shoulder radiographs for instability, fracture, or AC injury patterns.",
        page: 9,
        citations: ["shoulder-acr-2025", "acr-msk-criteria"]
      }
    ],
    referralRules: [
      {
        id: "shoulder-severe-referral",
        title: "Severe shoulder referral",
        when: {
          any: [
            yes("instability_tests_positive"),
            yes("rotator_cuff_tests_positive"),
            yes("ac_joint_tests_positive")
          ]
        },
        disposition: "PT, OT, Sports Medicine, or Orthopedics within 72 hours.",
        urgency: "72-hours",
        page: 9,
        citations: ["shoulder-injuries-2023"]
      },
      {
        id: "shoulder-persistent-referral",
        title: "Persistent shoulder symptoms",
        when: { any: [yes("symptoms_persist")] },
        disposition: "PT, OT, Sports Medicine, or Orthopedics in 7 days.",
        urgency: "7-10-days",
        page: 9,
        citations: ["shoulder-injuries-2023"]
      }
    ],
    profileTemplates: [
      {
        id: "shoulder-minimal",
        severity: "minimal",
        durationDays: 7,
        commanderLimitations: [
          "No overhead lifting or combatives",
          "No pushups or loaded carries",
          "Return to duty expected after short profile"
        ],
        soldierInstructions: [
          "No sling for mild injuries.",
          "Use PEACE principles and analgesics as needed.",
          "Progress ROM as tolerated."
        ]
      },
      {
        id: "shoulder-moderate",
        severity: "moderate",
        durationDays: 14,
        commanderLimitations: [
          "No overhead work, pushups, or weapons carry on the affected side",
          "No rucking or heavy lifting",
          "Limit repetitive reaching"
        ],
        soldierInstructions: [
          "Use PEACE principles and analgesics as needed.",
          "No sling unless instability or severe pain requires it.",
          "Reassess at the end of profile."
        ]
      },
      {
        id: "shoulder-severe",
        severity: "severe",
        durationDays: 10,
        commanderLimitations: [
          "No field duty, lifting, climbing, or impact training",
          "Sling only for instability, suspected fracture, or severe pain",
          "Await specialist clearance before return to duty"
        ],
        soldierInstructions: [
          "If a sling is used, remove it hourly for gentle motion and do not sleep in it.",
          "Use PEACE principles and analgesics as needed.",
          "Urgent specialty follow-up is required."
        ]
      }
    ],
    conditions: [
      {
        id: "shoulder-fracture-dislocation",
        name: "Shoulder fracture, dislocation, or major soft-tissue injury",
        icd10: "S43.006A",
        description: "Deformity or unwillingness to move after acute trauma raises concern for fracture or dislocation.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("deformity")] },
        disposition: "Radiographs and urgent orthopedic discussion.",
        emergency: true,
        emergencyReason: "Major shoulder structural injury is suspected.",
        workup: ["Shoulder X-ray: AP, lateral, axillary", "Urgent orthopedic discussion"],
        treatment: ["Sling for severe pain or instability", "Analgesic medications as needed", "Protective profile"],
        profileTemplateId: "shoulder-severe",
        citations: ["shoulder-injuries-2023", "shoulder-acr-2025"]
      },
      {
        id: "shoulder-septic",
        name: "Septic shoulder or infected soft tissue",
        icd10: "M00.9",
        description: "Hot swollen painful shoulder with fever or drainage warrants urgent escalation.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("infection_or_septic_joint")] },
        disposition: "Urgent infectious workup and escalation.",
        emergency: true,
        emergencyReason: "Septic shoulder concern is present.",
        workup: ["Urgent infectious evaluation", "Imaging/labs as clinically indicated"],
        treatment: ["Activity restriction", "Do not manage as routine shoulder strain"],
        profileTemplateId: "shoulder-severe",
        sharedBlockIds: ["septic-crystal-warning"],
        citations: ["shoulder-injuries-2023"]
      },
      {
        id: "shoulder-cervical-referral",
        name: "Referred cervical pain pattern",
        icd10: "M54.2",
        description: "Shoulder symptoms that follow a cervical pattern should be worked up via the neck algorithm.",
        likelihood: "Medium",
        severity: "moderate",
        when: { all: [yes("cervical_spine_pain")] },
        disposition: "Route through the neck pathway and treat as cervical pain until proven otherwise.",
        emergency: false,
        workup: ["Neck pathway screening and imaging criteria"],
        treatment: ["Avoid local shoulder overload until source is clarified"],
        profileTemplateId: "shoulder-moderate",
        citations: ["shoulder-injuries-2023", "neck-guideline-2017"]
      },
      {
        id: "shoulder-instability",
        name: "Anterior shoulder instability or labral injury",
        icd10: "S43.431A",
        description: "Positive apprehension/relocation testing supports instability or labral pathology.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("instability_tests_positive")] },
        disposition: "Severe outpatient management with expedited referral.",
        emergency: false,
        workup: ["Shoulder radiographs", "MRI not indicated acutely"],
        treatment: ["Sling if unstable or severely painful", "PEACE principles", "Analgesic medications as needed"],
        profileTemplateId: "shoulder-severe",
        citations: ["shoulder-injuries-2023", "shoulder-acr-2025"]
      },
      {
        id: "shoulder-rotator-cuff",
        name: "Acute rotator cuff injury",
        icd10: "S46.001A",
        description: "Positive cuff testing with weakness or painful ROM supports acute rotator cuff injury.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("rotator_cuff_tests_positive")] },
        disposition: "Severe outpatient management with early rehab or specialty follow-up.",
        emergency: false,
        workup: ["Shoulder radiographs", "MRI not indicated acutely"],
        treatment: ["PEACE principles", "Analgesic medications as needed", "Protected use and early follow-up"],
        profileTemplateId: "shoulder-severe",
        citations: ["shoulder-injuries-2023"]
      },
      {
        id: "shoulder-ac-joint",
        name: "AC joint sprain or separation",
        icd10: "S43.50XA",
        description: "Positive AC cluster findings support AC joint sprain or separation.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("ac_joint_tests_positive")] },
        disposition: "Severe outpatient management with early follow-up.",
        emergency: false,
        workup: ["Shoulder radiographs including AC series"],
        treatment: ["PEACE principles", "Analgesic medications as needed", "Sling if severe pain warrants it"],
        profileTemplateId: "shoulder-severe",
        citations: ["shoulder-injuries-2023"]
      },
      {
        id: "shoulder-strain",
        name: "Acute shoulder strain or contusion",
        icd10: "S46.919A",
        description: "Painful ROM or strength loss without major instability or fracture concern supports moderate shoulder strain.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("decreased_rom"), yes("decreased_strength"), yes("symptoms_persist")] },
        disposition: "Routine outpatient management with follow-up.",
        emergency: false,
        workup: ["Consider shoulder radiographs if not already obtained"],
        treatment: ["PEACE principles", "Analgesic medications as needed", "Progressive ROM"],
        profileTemplateId: "shoulder-moderate",
        citations: ["shoulder-injuries-2023", "peace-love-2020"]
      },
      {
        id: "shoulder-fallback",
        name: "Minor shoulder soft-tissue injury",
        icd10: "S46.919A",
        description: "Stable acute shoulder pain without red flags can be managed conservatively.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No immediate advanced imaging if improving"],
        treatment: ["Analgesic medications as needed", "PEACE principles", "Progressive activity return"],
        profileTemplateId: "shoulder-minimal",
        citations: ["shoulder-injuries-2023", "peace-love-2020"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Subacromial impingement",
        icd10: "M75.41",
        description: "Consider when Hawkins or Neer symptoms predominate without gross weakness.",
        likelihood: "Low"
      },
      {
        name: "Distal biceps irritation",
        icd10: "M75.21",
        description: "Consider when anterior shoulder symptoms localize toward the bicipital groove.",
        likelihood: "Low"
      }
    ]
  },
  {
    id: "arm-elbow",
    title: "Traumatic and Acute Arm/Elbow Pain",
    summary: "Use elbow extension testing and red-flag screening to separate fracture, instability, biceps rupture, ulnar neuropathy, and routine elbow soft-tissue injury.",
    bodyRegionLabel: "Arm / Elbow",
    primaryPages: [12, 13],
    referencePage: 21,
    sampleCase: {
      bodyRegion: "arm-elbow",
      careLocation: "CTMC",
      chiefComplaint:
        "Acute elbow pain after FOOSH with swelling and painful extension.",
      vitals: "BP 124/74, HR 79, RR 16, Temp 98.2F, SpO2 99%",
      physicalExam:
        "Elbow edema, painful terminal extension, cap refill intact, pulses present.",
      pmh: "No prior elbow fracture.",
      allergies: "NKDA",
      meds: "None",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("positive_elbow_extension_test", "Positive elbow extension test", "Is there visible side-to-side difference in elbow extension or persistent concerning symptoms after the elbow extension test?", 12, "special-test"),
      boolNode("foosh_with_painful_elbow", "FOOSH with painful elbow", "Was there a fall on an outstretched hand with painful elbow?", 12, "history"),
      boolNode("biceps_pop", "Distal biceps pop", "Was there a lifting/stretching event with a pop at the biceps insertion?", 12, "history"),
      boolNode("deformity_or_swelling", "Deformity or swelling", "Is there deformity or acute swelling with limited ROM?", 12, "red-flag"),
      boolNode("neurovascular_compromise", "Neurovascular compromise", "Is there diminished/absent distal pulse or other neurovascular compromise?", 12, "red-flag"),
      boolNode("compartment_syndrome_signs", "Compartment syndrome signs", "Are there pain-out-of-proportion features, crush injury, stretch pain, numbness, or fullness suggesting compartment syndrome?", 12, "red-flag"),
      boolNode("infection_or_septic_joint", "Infection or septic joint", "Are there infection or septic joint features, bites, puncture wounds, or exudate?", 12, "red-flag"),
      boolNode("ligament_instability_tests_positive", "Ligament instability tests positive", "Is moving valgus stress or posterolateral rotary instability testing positive?", 12, "special-test"),
      boolNode("ulnar_nerve_tests_positive", "Ulnar nerve tests positive", "Are Tinel or combined pressure/flexion provocative tests positive for ulnar nerve symptoms?", 12, "special-test"),
      boolNode("radial_head_tenderness", "Radial head tenderness", "Is there tenderness to palpation over the radial head or neck?", 12, "exam"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have symptoms persisted after the initial profile window?", 12, "follow-up")
    ],
    redFlags: [
      {
        id: "arm-elbow-redflags",
        title: "Urgent arm and elbow red flags",
        when: {
          any: [
            yes("positive_elbow_extension_test"),
            yes("deformity_or_swelling"),
            yes("neurovascular_compromise"),
            yes("compartment_syndrome_signs"),
            yes("infection_or_septic_joint")
          ]
        },
        outcome: "Obtain AP/lateral/oblique forearm-elbow radiographs and discuss urgent findings with Orthopedics or OT.",
        urgency: "today",
        emergency: true,
        page: 12,
        citations: ["elbow-eval-2014", "nerve-entrapment-2021"]
      }
    ],
    specialTests: [
      {
        id: "positive_elbow_extension_test",
        name: "Elbow extension test",
        positiveFinding: "Visible extension asymmetry or persistent concern after comparison testing",
        page: 13,
        relatedDiagnoses: ["Elbow fracture"]
      },
      {
        id: "ligament_instability_tests_positive",
        name: "Moving valgus / posterolateral rotary instability",
        positiveFinding: "Pain, instability, or apprehension with instability testing",
        page: 13,
        relatedDiagnoses: ["Ligamentous instability"]
      },
      {
        id: "ulnar_nerve_tests_positive",
        name: "Ulnar nerve provocative testing",
        positiveFinding: "Symptoms reproduced in the ulnar nerve distribution",
        page: 13,
        relatedDiagnoses: ["Ulnar neuropathy"]
      }
    ],
    imagingRules: [
      {
        id: "arm-elbow-imaging",
        title: "Elbow fracture imaging rule",
        when: {
          any: [
            yes("positive_elbow_extension_test"),
            yes("foosh_with_painful_elbow"),
            yes("deformity_or_swelling"),
            yes("radial_head_tenderness")
          ]
        },
        orders: ["Forearm/elbow X-ray: AP, lateral, oblique"],
        rationale: "FOOSH, positive elbow extension testing, swelling, or radial head tenderness heighten fracture concern.",
        page: 12,
        citations: ["elbow-eval-2014", "acr-msk-criteria"]
      }
    ],
    referralRules: [
      {
        id: "arm-elbow-severe-referral",
        title: "Severe elbow referral",
        when: {
          any: [
            yes("ligament_instability_tests_positive"),
            yes("biceps_pop"),
            yes("positive_elbow_extension_test")
          ]
        },
        disposition: "OT or Orthopedics within 72 hours.",
        urgency: "72-hours",
        page: 12,
        citations: ["elbow-eval-2014"]
      }
    ],
    profileTemplates: [
      {
        id: "arm-elbow-minimal",
        severity: "minimal",
        durationDays: 10,
        commanderLimitations: [
          "No pushups, heavy lifting, or combatives",
          "No repetitive gripping with the affected arm",
          "Return to duty expected at end of profile"
        ],
        soldierInstructions: [
          "Use PEACE principles and analgesics as needed.",
          "Avoid prolonged sling use for mild injuries.",
          "Stretch into extension as tolerated."
        ]
      },
      {
        id: "arm-elbow-moderate",
        severity: "moderate",
        durationDays: 14,
        commanderLimitations: [
          "No lifting, climbing, or weapons handling on the affected side",
          "No pushups or combat drills",
          "Limit forceful gripping"
        ],
        soldierInstructions: [
          "Use PEACE principles and analgesics as needed.",
          "Re-evaluate at the end of profile.",
          "Use sling only if specifically indicated."
        ]
      },
      {
        id: "arm-elbow-severe",
        severity: "severe",
        durationDays: 21,
        commanderLimitations: [
          "No field duty or forceful arm use",
          "Sling only as needed for instability or radial head injury; remove hourly",
          "Await specialist clearance before return to duty"
        ],
        soldierInstructions: [
          "Remove sling hourly for ROM into extension and do not sleep in the sling.",
          "Use PEACE principles and analgesics as needed.",
          "Urgent specialist follow-up is required."
        ]
      }
    ],
    conditions: [
      {
        id: "arm-elbow-fracture",
        name: "Elbow or forearm fracture concern",
        icd10: "S52.90XA",
        description: "Positive elbow extension testing, FOOSH, swelling, or radial head tenderness supports fracture concern.",
        likelihood: "High",
        severity: "severe",
        when: {
          any: [
            yes("positive_elbow_extension_test"),
            yes("foosh_with_painful_elbow"),
            yes("deformity_or_swelling"),
            yes("radial_head_tenderness")
          ]
        },
        disposition: "Obtain radiographs and discuss urgent findings with Orthopedics.",
        emergency: true,
        emergencyReason: "Fracture or dislocation concern is present in the elbow pathway.",
        workup: ["Forearm/elbow X-ray: AP, lateral, oblique"],
        treatment: ["Sling if needed for stability or pain", "Analgesic medications as needed", "Protective profile"],
        profileTemplateId: "arm-elbow-severe",
        citations: ["elbow-eval-2014"]
      },
      {
        id: "arm-elbow-biceps",
        name: "Distal biceps rupture",
        icd10: "S46.219A",
        description: "Pop at the biceps insertion after lifting or stretching raises concern for distal biceps rupture.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("biceps_pop")] },
        disposition: "Urgent Orthopedics follow-up.",
        emergency: false,
        workup: ["Specialty evaluation", "Radiographs if trauma suggests bony injury"],
        treatment: ["Sling as needed", "Analgesic medications as needed", "No lifting with affected arm"],
        profileTemplateId: "arm-elbow-severe",
        citations: ["elbow-eval-2014"]
      },
      {
        id: "arm-elbow-infection",
        name: "Septic elbow or infected soft tissue",
        icd10: "M00.9",
        description: "Hot swollen elbow, puncture, or bite-related infection requires urgent escalation.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("infection_or_septic_joint")] },
        disposition: "Urgent infectious workup and escalation.",
        emergency: true,
        emergencyReason: "Infection or septic joint concern is present in the elbow pathway.",
        workup: ["Urgent infectious evaluation", "Imaging and labs as indicated"],
        treatment: ["Do not manage as routine sprain", "Activity restriction"],
        profileTemplateId: "arm-elbow-severe",
        sharedBlockIds: ["septic-crystal-warning"],
        citations: ["elbow-eval-2014"]
      },
      {
        id: "arm-elbow-instability",
        name: "Elbow ligamentous instability",
        icd10: "S53.409A",
        description: "Positive moving valgus or rotary instability testing suggests ligament injury.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("ligament_instability_tests_positive")] },
        disposition: "Expedited OT or Orthopedics follow-up.",
        emergency: false,
        workup: ["Radiographs if not already obtained"],
        treatment: ["Sling if needed", "PEACE principles", "Analgesic medications as needed"],
        profileTemplateId: "arm-elbow-severe",
        citations: ["elbow-eval-2014"]
      },
      {
        id: "arm-elbow-ulnar",
        name: "Ulnar neuropathy or cubital tunnel irritation",
        icd10: "G56.21",
        description: "Ulnar nerve provocative symptoms suggest neuropathy rather than isolated bony injury.",
        likelihood: "Medium",
        severity: "moderate",
        when: { all: [yes("ulnar_nerve_tests_positive")] },
        disposition: "Outpatient management with specialist follow-up if persistent.",
        emergency: false,
        workup: ["Neurovascular reassessment", "Consider imaging if trauma suggests fracture"],
        treatment: ["Activity modification", "Analgesic medications as needed", "Protect against prolonged elbow flexion or pressure"],
        profileTemplateId: "arm-elbow-moderate",
        citations: ["nerve-entrapment-2021"]
      },
      {
        id: "arm-elbow-sprain",
        name: "Arm or elbow soft-tissue injury",
        icd10: "S53.409A",
        description: "Painful ROM without urgent structural findings supports soft-tissue injury.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("symptoms_persist")] },
        disposition: "Routine outpatient management with 7-10 day referral if not improving.",
        emergency: false,
        workup: ["Consider radiographs if symptoms are not improving"],
        treatment: ["PEACE principles", "Analgesic medications as needed", "Stretch toward extension"],
        profileTemplateId: "arm-elbow-moderate",
        citations: ["elbow-eval-2014", "peace-love-2020"]
      },
      {
        id: "arm-elbow-fallback",
        name: "Minor elbow strain or contusion",
        icd10: "S59.909A",
        description: "Stable elbow pain without red flags can be managed conservatively.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No immediate imaging if low suspicion and improving"],
        treatment: ["PEACE principles", "Analgesic medications as needed", "Short activity modification"],
        profileTemplateId: "arm-elbow-minimal",
        citations: ["elbow-eval-2014", "peace-love-2020"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Radial head injury",
        icd10: "S52.123A",
        description: "Consider when isolated radial head tenderness is present after FOOSH.",
        likelihood: "Low"
      },
      {
        name: "Olecranon bursitis",
        icd10: "M70.22",
        description: "Consider in posterior elbow swelling without fracture pattern.",
        likelihood: "Low"
      }
    ]
  },
  {
    id: "hand-wrist",
    title: "Traumatic and Acute Hand/Wrist Pain",
    summary: "Use fracture, neurovascular, tendon, infectious tenosynovitis, and nerve-compression screening to triage wrist and hand injuries.",
    bodyRegionLabel: "Hand / Wrist",
    primaryPages: [14, 15],
    referencePage: 22,
    sampleCase: {
      bodyRegion: "hand-wrist",
      careLocation: "CTMC",
      chiefComplaint:
        "Acute wrist pain after FOOSH with snuffbox tenderness and hand swelling.",
      vitals: "BP 120/70, HR 77, RR 15, Temp 98.3F, SpO2 99%",
      physicalExam:
        "Hand edema, painful ROM, snuffbox tenderness, cap refill intact.",
      pmh: "No prior fracture.",
      allergies: "NKDA",
      meds: "None",
      priorLabsImaging: ""
    },
    decisionNodes: [
      boolNode("general_red_flags", "General hand/wrist red flags", "Is the patient unwilling to move the hand, unable to flex/extend an individual digit, or does trauma produce swelling with limited ROM?", 14, "red-flag"),
      boolNode("foosh_snuffbox_or_dislocation", "FOOSH with snuffbox pain/dislocation concern", "Was there FOOSH with anatomical snuffbox tenderness or visible dislocation signs?", 14, "red-flag"),
      boolNode("deformity", "Deformity", "Is deformity of the wrist or hand present?", 14, "red-flag"),
      boolNode("neurovascular_compromise", "Neurovascular compromise", "Is there neurovascular compromise on exam?", 14, "red-flag"),
      boolNode("kanavel_signs", "Kanavel signs", "Are Kanavel signs of infectious flexor tenosynovitis present?", 15, "red-flag"),
      boolNode("infection_or_septic_joint", "Infection or septic joint", "Are there infection signs, puncture wound, bite injury, fever, or septic joint features?", 14, "red-flag"),
      boolNode("finkelstein_positive", "Finkelstein positive", "Is Finkelstein testing positive for de Quervain tenosynovitis?", 15, "special-test"),
      boolNode("allen_positive", "Allen test positive", "Is Allen testing positive for arterial occlusion?", 15, "special-test"),
      boolNode("median_nerve_tests_positive", "Median nerve tests positive", "Are Tinel or Phalen tests positive for median nerve symptoms?", 15, "special-test"),
      boolNode("mallet_ganglion_trigger", "Other tendon or cyst finding", "Is there mallet finger, ganglion cyst, trigger finger, or another obvious tendon-related lesion?", 15, "exam"),
      boolNode("bone_tenderness", "Bone tenderness", "Is there focal bony tenderness in the hand or wrist?", 14, "exam"),
      boolNode("subungual_hematoma", "Subungual hematoma", "Is there a painful subungual hematoma?", 16, "history"),
      boolNode("nailbed_laceration", "Nail-bed laceration", "Is there nail-bed laceration or distal fingertip soft-tissue trauma?", 16, "history"),
      boolNode("symptoms_persist", "Persistent symptoms", "Have symptoms persisted beyond the initial profile window?", 14, "follow-up")
    ],
    redFlags: [
      {
        id: "hand-redflags",
        title: "Urgent hand and wrist red flags",
        when: {
          any: [
            yes("general_red_flags"),
            yes("foosh_snuffbox_or_dislocation"),
            yes("deformity"),
            yes("neurovascular_compromise"),
            yes("kanavel_signs"),
            yes("infection_or_septic_joint"),
            yes("allen_positive")
          ]
        },
        outcome: "Obtain AP/lateral wrist or hand radiographs and call Orthopedics or OT today for red-flag findings.",
        urgency: "today",
        emergency: true,
        page: 14,
        citations: ["hand-ed-2025", "flexor-tenosynovitis-2017"]
      }
    ],
    specialTests: [
      {
        id: "kanavel_signs",
        name: "Kanavel signs",
        positiveFinding: "Digit held in flexion, fusiform swelling, sheath tenderness, and pain with passive extension",
        page: 15,
        relatedDiagnoses: ["Infectious flexor tenosynovitis"]
      },
      {
        id: "finkelstein_positive",
        name: "Finkelstein test",
        positiveFinding: "Pain over the APL/EPB tendons reproducing symptoms",
        page: 15,
        relatedDiagnoses: ["De Quervain tenosynovitis"]
      },
      {
        id: "allen_positive",
        name: "Allen test",
        positiveFinding: "Hand does not flush red within five seconds",
        page: 15,
        relatedDiagnoses: ["Arterial occlusion"]
      },
      {
        id: "median_nerve_tests_positive",
        name: "Tinel and Phalen testing",
        positiveFinding: "Median nerve symptoms reproduced",
        page: 15,
        relatedDiagnoses: ["Carpal tunnel syndrome"]
      }
    ],
    imagingRules: [
      {
        id: "hand-wrist-imaging",
        title: "Hand/wrist fracture imaging",
        when: {
          any: [
            yes("foosh_snuffbox_or_dislocation"),
            yes("deformity"),
            yes("bone_tenderness"),
            yes("nailbed_laceration"),
            yes("subungual_hematoma")
          ]
        },
        orders: ["Hand or wrist X-ray: AP and lateral views", "Finger/toe radiographs for nail injury when fracture is suspected"],
        rationale: "The algorithm recommends radiographs for FOOSH, dislocation/fracture concern, and nail injuries with fracture risk.",
        page: 14,
        citations: ["hand-ed-2025", "acr-msk-criteria"]
      }
    ],
    referralRules: [
      {
        id: "hand-wrist-severe-referral",
        title: "Severe hand/wrist referral",
        when: {
          any: [
            yes("kanavel_signs"),
            yes("allen_positive"),
            yes("foosh_snuffbox_or_dislocation"),
            yes("nailbed_laceration")
          ]
        },
        disposition: "OT or Orthopedics within 72 hours or today if red flags are severe.",
        urgency: "72-hours",
        page: 14,
        citations: ["hand-ed-2025", "flexor-tenosynovitis-2017"]
      }
    ],
    profileTemplates: [
      {
        id: "hand-wrist-minimal",
        severity: "minimal",
        durationDays: 10,
        commanderLimitations: [
          "No pushups, weapons drills, or forceful gripping",
          "Avoid lifting over 10 pounds with the affected hand",
          "Return to duty expected at end of profile"
        ],
        soldierInstructions: [
          "Use PEACE principles and analgesics as needed.",
          "Protect the hand from repeat impact.",
          "Return sooner for increasing numbness or swelling."
        ]
      },
      {
        id: "hand-wrist-moderate",
        severity: "moderate",
        durationDays: 14,
        commanderLimitations: [
          "No gripping, climbing, or lifting with the affected hand",
          "Splint as directed",
          "Avoid combatives and weapons handling"
        ],
        soldierInstructions: [
          "Use splinting as directed.",
          "PEACE principles and analgesics as needed.",
          "Reassess if not improving."
        ]
      },
      {
        id: "hand-wrist-severe",
        severity: "severe",
        durationDays: 21,
        commanderLimitations: [
          "No field duty, weapons handling, or lifting with the affected hand",
          "Formal splinting when indicated",
          "Await specialist clearance before return to duty"
        ],
        soldierInstructions: [
          "Do not start empiric antimicrobial therapy before discussion when the hand infection algorithm says to hold it.",
          "Maintain splinting and elevation as directed.",
          "Urgent follow-up is required."
        ]
      }
    ],
    conditions: [
      {
        id: "hand-wrist-fracture",
        name: "Hand or wrist fracture/dislocation concern",
        icd10: "S62.90XA",
        description: "FOOSH with snuffbox tenderness, deformity, or focal bone tenderness supports fracture/dislocation concern.",
        likelihood: "High",
        severity: "severe",
        when: {
          any: [
            yes("foosh_snuffbox_or_dislocation"),
            yes("deformity"),
            yes("bone_tenderness")
          ]
        },
        disposition: "Radiographs and urgent specialist review when fracture or dislocation is suspected.",
        emergency: true,
        emergencyReason: "Hand or wrist fracture/dislocation concern is present.",
        workup: ["Hand/wrist radiographs", "Consider scaphoid-protective management if FOOSH with snuffbox tenderness"],
        treatment: ["Splint as needed", "Analgesic medications as needed", "Protective profile"],
        profileTemplateId: "hand-wrist-severe",
        citations: ["hand-ed-2025"]
      },
      {
        id: "hand-wrist-tenosynovitis",
        name: "Infectious flexor tenosynovitis",
        icd10: "M65.141",
        description: "Kanavel signs indicate urgent flexor tendon sheath infection until proven otherwise.",
        likelihood: "Very High",
        severity: "severe",
        when: { all: [yes("kanavel_signs")] },
        disposition: "Urgent orthopedic discussion and escalation.",
        emergency: true,
        emergencyReason: "Kanavel signs suggest infectious flexor tenosynovitis.",
        workup: ["Urgent surgical/orthopedic evaluation", "Do not start antimicrobials until discussion per algorithm"],
        treatment: ["Activity restriction", "Protective splinting"],
        profileTemplateId: "hand-wrist-severe",
        sharedBlockIds: ["septic-crystal-warning"],
        citations: ["flexor-tenosynovitis-2017"]
      },
      {
        id: "hand-wrist-infection",
        name: "Septic joint or hand infection",
        icd10: "M00.9",
        description: "Puncture wounds, bites, fever, or exudate support infection rather than isolated sprain.",
        likelihood: "High",
        severity: "severe",
        when: { all: [yes("infection_or_septic_joint")] },
        disposition: "Urgent infectious workup and specialist discussion.",
        emergency: true,
        emergencyReason: "Hand infection or septic joint concern is present.",
        workup: ["Urgent infection evaluation", "Radiographs if trauma or retained foreign body is possible"],
        treatment: ["Protective splinting", "Escalate promptly for worsening swelling or drainage"],
        profileTemplateId: "hand-wrist-severe",
        citations: ["hand-ed-2025"]
      },
      {
        id: "hand-wrist-vascular",
        name: "Arterial occlusion or vascular injury",
        icd10: "I74.2",
        description: "Positive Allen testing or neurovascular compromise requires urgent vascular consideration.",
        likelihood: "High",
        severity: "severe",
        when: { any: [yes("allen_positive"), yes("neurovascular_compromise")] },
        disposition: "Urgent vascular/orthopedic escalation.",
        emergency: true,
        emergencyReason: "Potential hand vascular compromise is present.",
        workup: ["Urgent vascular assessment", "Radiographs if trauma suggests fracture/dislocation"],
        treatment: ["Protective splinting", "Do not treat as routine wrist pain"],
        profileTemplateId: "hand-wrist-severe",
        sharedBlockIds: ["vascular-injury"],
        citations: ["hand-ed-2025"]
      },
      {
        id: "hand-wrist-dequervain",
        name: "De Quervain tenosynovitis",
        icd10: "M65.4",
        description: "Positive Finkelstein testing supports first dorsal compartment tenosynovitis.",
        likelihood: "High",
        severity: "moderate",
        when: { all: [yes("finkelstein_positive")] },
        disposition: "Routine outpatient management with splinting and rehab follow-up if needed.",
        emergency: false,
        workup: ["No immediate imaging unless fracture remains a concern"],
        treatment: ["Splinting", "Activity modification", "Analgesic medications as needed"],
        profileTemplateId: "hand-wrist-moderate",
        citations: ["hand-ed-2025"]
      },
      {
        id: "hand-wrist-median-nerve",
        name: "Median nerve compression pattern",
        icd10: "G56.01",
        description: "Positive Tinel or Phalen testing supports carpal tunnel or related median neuropathy.",
        likelihood: "Medium",
        severity: "moderate",
        when: { all: [yes("median_nerve_tests_positive")] },
        disposition: "Routine outpatient management and follow-up if symptoms persist.",
        emergency: false,
        workup: ["No acute imaging unless trauma suggests fracture"],
        treatment: ["Neutral wrist protection", "Analgesic medications as needed", "Activity modification"],
        profileTemplateId: "hand-wrist-moderate",
        citations: ["cts-2016", "nerve-entrapment-2021"]
      },
      {
        id: "hand-wrist-nail",
        name: "Nail-bed injury or subungual hematoma",
        icd10: "S61.309A",
        description: "Painful nail trauma may require decompression, nail-bed repair, and radiographs.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("subungual_hematoma"), yes("nailbed_laceration")] },
        disposition: "Treat supportively or refer for nail-bed care depending on size and laceration severity.",
        emergency: false,
        workup: ["Digit radiographs when fracture is suspected", "Specialist review for nail-bed laceration"],
        treatment: ["Splint fingertip if tender", "Consider decompression or nail-bed repair through specialist pathway", "Tetanus review if indicated"],
        profileTemplateId: "hand-wrist-moderate",
        sharedBlockIds: ["nail-injury-management"],
        citations: ["hand-ed-2025"]
      },
      {
        id: "hand-wrist-other",
        name: "Other tendon or cyst-related hand lesion",
        icd10: "M67.40",
        description: "Mallet finger, trigger finger, or ganglion-type findings support localized tendon or cyst pathology.",
        likelihood: "Medium",
        severity: "moderate",
        when: { any: [yes("mallet_ganglion_trigger"), yes("symptoms_persist")] },
        disposition: "Outpatient splinting and OT/Ortho follow-up.",
        emergency: false,
        workup: ["Radiographs if bony avulsion or fracture is a concern"],
        treatment: ["Splinting", "Analgesic medications as needed", "Activity modification"],
        profileTemplateId: "hand-wrist-moderate",
        citations: ["hand-ed-2025"]
      },
      {
        id: "hand-wrist-fallback",
        name: "Minor hand or wrist soft-tissue injury",
        icd10: "S69.90XA",
        description: "Stable hand or wrist pain without red flags can be managed conservatively.",
        likelihood: "Medium",
        severity: "minimal",
        fallback: true,
        when: {},
        disposition: "Routine outpatient management.",
        emergency: false,
        workup: ["No immediate imaging if fracture concern is low and symptoms are improving"],
        treatment: ["PEACE principles", "Analgesic medications as needed", "Short activity modification"],
        profileTemplateId: "hand-wrist-minimal",
        citations: ["hand-ed-2025", "peace-love-2020"]
      }
    ],
    defaultDifferentials: [
      {
        name: "Scaphoid injury",
        icd10: "S62.009A",
        description: "Consider with FOOSH and snuffbox tenderness even if initial radiographs are negative.",
        likelihood: "Low"
      },
      {
        name: "Trigger finger",
        icd10: "M65.30",
        description: "Consider when catching or locking occurs during digit flexion and extension.",
        likelihood: "Low"
      }
    ]
  }
];

const validatedReferences = referenceEntrySchema.array().parse(references);
const validatedSharedBlocks = sharedReferenceBlockSchema.array().parse(sharedBlocks);
const validatedPathways = pathwayDefinitionSchema.array().parse(pathways);

export const referenceCatalog = validatedReferences;
export const sharedReferenceBlocks = validatedSharedBlocks;
export const pathwayCatalog = validatedPathways;

export const bodyRegionLabels: Record<BodyRegion, string> = Object.fromEntries(
  validatedPathways.map((pathway) => [pathway.id, pathway.bodyRegionLabel])
) as Record<BodyRegion, string>;
