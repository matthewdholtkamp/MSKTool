import {
  buildPlanResponse,
  pathwayCatalog,
  type AnswerSet,
  type DecisionNode,
  type PathwayDefinition,
  type PlanResponse,
  type ReferenceEntry
} from "../packages/msk-content/src/index";

type ProtocolEntry = {
  key: string;
  title: string;
  searchText: string;
  pathway: PathwayDefinition;
};

const protocolEntries: ProtocolEntry[] = pathwayCatalog.map((pathway, index) => ({
  key: `B-${index + 1}`,
  title: pathway.title.replace("Traumatic and Acute ", ""),
  searchText: `${pathway.title} ${pathway.bodyRegionLabel} ${pathway.id}`.toLowerCase(),
  pathway
}));

const categoryConfig = {
  key: "B",
  title: "Musculoskeletal Complaints",
  protocols: protocolEntries
};

const appState: {
  currentProtocol: ProtocolEntry | null;
  currentQuestionIndex: number;
  answers: AnswerSet;
  history: Array<{ question: string; answer: string }>;
  currentPlan: PlanResponse | null;
} = {
  currentProtocol: null,
  currentQuestionIndex: 0,
  answers: {},
  history: [],
  currentPlan: null
};

const el = <T extends HTMLElement>(id: string) => {
  const node = document.getElementById(id) as T | null;

  if (!node) {
    throw new Error(`Missing element: ${id}`);
  }

  return node;
};

function getDefaultIntake(pathway: PathwayDefinition) {
  return {
    bodyRegion: pathway.id,
    careLocation: "CTMC" as const,
    chiefComplaint: pathway.title,
    vitals: "",
    physicalExam: "",
    pmh: "",
    allergies: "",
    meds: "",
    priorLabsImaging: ""
  };
}

function getNodeById(pathway: PathwayDefinition, id: string) {
  return pathway.decisionNodes.find((node) => node.id === id);
}

function getRedFlagLabels(pathway: PathwayDefinition) {
  const factIds = pathway.redFlags.flatMap((rule) => [
    ...(rule.when.all ?? []).map((item) => item.fact),
    ...(rule.when.any ?? []).map((item) => item.fact)
  ]);

  return [...new Set(factIds)]
    .map((factId) => getNodeById(pathway, factId)?.label ?? factId)
    .filter(Boolean);
}

function getRedFlagFactIds(pathway: PathwayDefinition) {
  return new Set(
    pathway.redFlags.flatMap((rule) => [
      ...(rule.when.all ?? []).map((item) => item.fact),
      ...(rule.when.any ?? []).map((item) => item.fact)
    ])
  );
}

function completeAnswers(pathway: PathwayDefinition, answers: AnswerSet) {
  const completed: AnswerSet = { ...answers };

  pathway.decisionNodes.forEach((node) => {
    if (typeof completed[node.id] === "undefined") {
      completed[node.id] = false;
    }
  });

  return completed;
}

function resetState() {
  appState.currentProtocol = null;
  appState.currentQuestionIndex = 0;
  appState.answers = {};
  appState.history = [];
  appState.currentPlan = null;
}

function showScreen(screen: "home" | "protocol" | "disposition" | "red-flags") {
  el("home-screen").classList.toggle("hidden", screen !== "home");
  el("protocol-screen").classList.toggle("hidden", screen !== "protocol");
  el("disposition-screen").classList.toggle("hidden", screen !== "disposition");
  el("red-flags-list-screen").classList.toggle("hidden", screen !== "red-flags");
  el("home-button").classList.toggle(
    "hidden",
    screen === "home"
  );
}

function populateHomeScreen() {
  const protocolList = el("protocol-list");
  protocolList.innerHTML = "";

  const categoryContainer = document.createElement("div");
  categoryContainer.className = "border border-gray-200 rounded-lg overflow-hidden";

  const header = document.createElement("button");
  header.type = "button";
  header.className =
    "w-full text-left bg-gray-50 px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100 transition-colors";
  header.textContent = `▼ ${categoryConfig.key}: ${categoryConfig.title}`;

  const content = document.createElement("div");
  content.className = "pl-4 pr-4 py-4 space-y-3";

  categoryConfig.protocols.forEach((protocol) => {
    const card = document.createElement("button");
    card.type = "button";
    card.dataset.protocolKey = protocol.key;
    card.className =
      "protocol-card w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400";
    card.innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-blue-600">${protocol.key}</p>
          <h3 class="text-lg font-semibold text-gray-900">${protocol.title}</h3>
          <p class="text-sm text-gray-500 mt-1">${protocol.pathway.summary}</p>
        </div>
        <span class="text-sm font-medium text-gray-400">${protocol.pathway.decisionNodes.length} checks</span>
      </div>
    `;
    content.appendChild(card);
  });

  header.addEventListener("click", () => {
    const isHidden = content.classList.toggle("hidden");
    header.textContent = `${isHidden ? "►" : "▼"} ${categoryConfig.key}: ${categoryConfig.title}`;
  });

  categoryContainer.appendChild(header);
  categoryContainer.appendChild(content);
  protocolList.appendChild(categoryContainer);
}

function populateAllRedFlags() {
  const wrapper = el("all-red-flags-content");
  wrapper.innerHTML = "";

  protocolEntries.forEach((protocol) => {
    const section = document.createElement("section");
    section.className = "border border-gray-200 rounded-lg p-4";
    section.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-900 mb-2">${protocol.key}: ${protocol.title}</h3>
      <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
        ${getRedFlagLabels(protocol.pathway)
          .map((label) => `<li>${label}</li>`)
          .join("")}
      </ul>
    `;
    wrapper.appendChild(section);
  });
}

function startProtocol(protocolKey: string) {
  const protocol = protocolEntries.find((entry) => entry.key === protocolKey);

  if (!protocol) {
    return;
  }

  resetState();
  appState.currentProtocol = protocol;

  el("protocol-title").textContent = `${protocol.key}: ${protocol.title}`;
  el("protocol-subtitle").textContent = protocol.pathway.summary;

  const redFlagsList = el("red-flags-list");
  redFlagsList.innerHTML = getRedFlagLabels(protocol.pathway)
    .map((label) => `<li>${label}</li>`)
    .join("");

  el("red-flags-container").classList.remove("hidden");
  el("decision-point-container").classList.add("hidden");
  showScreen("protocol");
}

function renderCurrentQuestion() {
  const currentProtocol = appState.currentProtocol;

  if (!currentProtocol) {
    return;
  }

  const node = currentProtocol.pathway.decisionNodes[appState.currentQuestionIndex];

  if (!node) {
    finalizeProtocol();
    return;
  }

  el("decision-point-container").classList.remove("hidden");
  el("action-container").classList.add("hidden");
  el("question-progress").textContent = `Question ${appState.currentQuestionIndex + 1} of ${currentProtocol.pathway.decisionNodes.length}`;
  el("question-page").textContent = `PDF page ${node.evidencePage}`;
  el("question-text").innerHTML = `
    <p class="font-semibold">${node.label}</p>
    <p class="mt-1">${node.question}</p>
  `;

  const help = el("help-text");
  if (node.helpText) {
    help.classList.remove("hidden");
    help.textContent = node.helpText;
  } else {
    help.classList.add("hidden");
    help.textContent = "";
  }

  const buttons = el("decision-buttons");
  buttons.innerHTML = "";

  const yesBtn = document.createElement("button");
  yesBtn.type = "button";
  yesBtn.className =
    "w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors";
  yesBtn.textContent = "Yes";
  yesBtn.onclick = () => recordAnswer(node, true);

  const noBtn = document.createElement("button");
  noBtn.type = "button";
  noBtn.className =
    "w-full bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors";
  noBtn.textContent = "No";
  noBtn.onclick = () => recordAnswer(node, false);

  buttons.appendChild(yesBtn);
  buttons.appendChild(noBtn);
}

function recordAnswer(node: DecisionNode, value: boolean) {
  const currentProtocol = appState.currentProtocol;

  if (!currentProtocol) {
    return;
  }

  appState.answers[node.id] = value;
  appState.history.push({
    question: node.label,
    answer: value ? "YES" : "NO"
  });

  const redFlagFactIds = getRedFlagFactIds(currentProtocol.pathway);
  if (value && redFlagFactIds.has(node.id)) {
    finalizeProtocol();
    return;
  }

  appState.currentQuestionIndex += 1;
  renderCurrentQuestion();
}

function classifyDisposition(plan: PlanResponse | null, redFlagOverride = false) {
  if (redFlagOverride) {
    return {
      label: "Provider Now",
      color: "text-red-600"
    };
  }

  if (!plan) {
    return {
      label: "Provider Now",
      color: "text-red-600"
    };
  }

  if (plan.plan.isEmergency) {
    return {
      label: "Provider Now",
      color: "text-red-600"
    };
  }

  if (plan.plan.disposition.toLowerCase().includes("same-day")) {
    return {
      label: "Advanced Enlisted Medic (AEM) Now",
      color: "text-yellow-600"
    };
  }

  if (plan.plan.workup.some((item) => item.toLowerCase().includes("referral"))) {
    return {
      label: "Specialty Referral",
      color: "text-blue-600"
    };
  }

  return {
    label: "MCP",
    color: "text-green-600"
  };
}

function formatPlanDetails(plan: PlanResponse, redFlagOverride = false) {
  const parts: string[] = [];

  if (redFlagOverride && plan.trace.redFlags[0]) {
    parts.push(`<p><strong>Urgent branch:</strong> ${plan.trace.redFlags[0].detail}</p>`);
  } else {
    parts.push(`<p><strong>Assessment:</strong> ${plan.assessment.synthesisStatement}</p>`);
  }

  if (plan.plan.workup.length > 0) {
    parts.push(`<p><strong>Workup / Imaging / Consults:</strong> ${plan.plan.workup.join("; ")}</p>`);
  }

  if (plan.plan.treatment.length > 0) {
    parts.push(`<p><strong>Treatment / Education:</strong> ${plan.plan.treatment.join("; ")}</p>`);
  }

  if (plan.plan.profile.commanderLimitations.length > 0) {
    parts.push(
      `<p><strong>Profile:</strong> ${plan.plan.profile.days} days. ${plan.plan.profile.commanderLimitations.join("; ")}</p>`
    );
  }

  if (plan.trace.sharedGuidance.length > 0) {
    parts.push(
      `<p><strong>Shared guidance:</strong> ${plan.trace.sharedGuidance
        .map((item) => `${item.title}: ${item.items.join(" ")}`)
        .join(" ")}</p>`
    );
  }

  return parts.join("");
}

function formatReferences(references: ReferenceEntry[]) {
  if (references.length === 0) {
    return "";
  }

  return references
    .map((reference) => {
      if (reference.url) {
        return `<p><strong>${reference.title}:</strong> <a class="text-blue-600 underline" href="${reference.url}" target="_blank" rel="noreferrer">${reference.citation}</a></p>`;
      }

      return `<p><strong>${reference.title}:</strong> ${reference.citation} (PDF page ${reference.page})</p>`;
    })
    .join("");
}

function generateSummary(plan: PlanResponse, protocol: ProtocolEntry, overrideLabel?: string) {
  const categoryDisposition = classifyDisposition(plan, Boolean(overrideLabel));
  let summary = `Chief Complaint: ${protocol.title} (Protocol ${protocol.key})\n\n`;
  summary += "S: Patient presents for MSK screening. Triage path below:\n";

  appState.history.forEach((item) => {
    summary += `- ${item.question}: ${item.answer}\n`;
  });

  summary += "\nO: Focused MSK screening performed per encoded pathway.\n";
  summary += `\nA: ${plan.assessment.synthesisStatement}\n`;
  summary += `\nP/D: ${overrideLabel ?? categoryDisposition.label}. ${plan.plan.disposition}\n`;

  if (plan.plan.workup.length > 0) {
    summary += "\n--- Workup / Imaging / Consults ---\n";
    summary += `${plan.plan.workup.join("\n")}\n`;
  }

  if (plan.plan.treatment.length > 0) {
    summary += "\n--- Treatment / Education ---\n";
    summary += `${plan.plan.treatment.join("\n")}\n`;
  }

  if (plan.plan.profile.commanderLimitations.length > 0) {
    summary += `\n--- Profile (${plan.plan.profile.days} days) ---\n`;
    summary += `${plan.plan.profile.commanderLimitations.join("\n")}\n`;
  }

  return summary.trim();
}

function showDisposition(plan: PlanResponse, options?: { overrideLabel?: string; summaryText?: string; redFlagOverride?: boolean }) {
  const protocol = appState.currentProtocol;

  if (!protocol) {
    return;
  }

  appState.currentPlan = plan;

  const categoryDisposition = classifyDisposition(plan, Boolean(options?.redFlagOverride));
  const result = el("disposition-result");
  result.textContent = options?.overrideLabel ?? categoryDisposition.label;
  result.className = `text-3xl font-bold mb-2 ${categoryDisposition.color}`;

  el("disposition-summary").textContent = options?.summaryText ?? plan.plan.disposition;

  const planContainer = el("plan-container");
  planContainer.classList.remove("hidden");
  el("plan-header").textContent = options?.redFlagOverride
    ? "Contextual Plan for Review"
    : "Treatment Protocol / Plan";
  el("plan-details").innerHTML = formatPlanDetails(plan, options?.redFlagOverride);

  const referencesHtml = formatReferences(plan.references);
  const referencesContainer = el("references-container");
  if (referencesHtml) {
    referencesContainer.classList.remove("hidden");
    el("references-details").innerHTML = referencesHtml;
  } else {
    referencesContainer.classList.add("hidden");
    el("references-details").innerHTML = "";
  }

  el("summary-text").textContent = generateSummary(
    plan,
    protocol,
    options?.overrideLabel
  );

  showScreen("disposition");
}

function finalizeProtocol() {
  const currentProtocol = appState.currentProtocol;

  if (!currentProtocol) {
    return;
  }

  const answers = completeAnswers(currentProtocol.pathway, appState.answers);
  const plan = buildPlanResponse({
    intake: getDefaultIntake(currentProtocol.pathway),
    answers
  });

  showDisposition(plan);
}

function handleRedFlagPresent() {
  const currentProtocol = appState.currentProtocol;

  if (!currentProtocol) {
    return;
  }

  appState.history.push({
    question: "Red Flags Check",
    answer: "PRESENT"
  });

  const pathway = currentProtocol.pathway;
  const redFlagFact = (pathway.redFlags[0]?.when.any ?? [])[0]?.fact;
  const answers = completeAnswers(pathway, redFlagFact ? { [redFlagFact]: true } : {});
  const plan = buildPlanResponse({
    intake: getDefaultIntake(pathway),
    answers
  });

  showDisposition(plan, {
    overrideLabel: "Provider Now",
    summaryText: pathway.redFlags[0]?.outcome ?? "Urgent escalation recommended by algorithm.",
    redFlagOverride: true
  });
}

function initApp() {
  resetState();
  populateHomeScreen();
  populateAllRedFlags();
  showScreen("home");
  el<HTMLInputElement>("search-bar").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();

  el("protocol-list").addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const card = target.closest("[data-protocol-key]") as HTMLElement | null;

    if (!card?.dataset.protocolKey) {
      return;
    }

    startProtocol(card.dataset.protocolKey);
  });

  el<HTMLInputElement>("search-bar").addEventListener("input", (event) => {
    const term = event.currentTarget.value.trim().toLowerCase();
    const cards = Array.from(
      el("protocol-list").querySelectorAll("[data-protocol-key]")
    ) as HTMLElement[];

    cards.forEach((card) => {
      const protocol = protocolEntries.find(
        (entry) => entry.key === card.dataset.protocolKey
      );
      const visible = !term || Boolean(protocol?.searchText.includes(term));
      card.style.display = visible ? "block" : "none";
    });
  });

  el("view-all-red-flags-btn").addEventListener("click", () => {
    showScreen("red-flags");
  });

  el("home-button").addEventListener("click", initApp);

  el("red-flag-present-btn").addEventListener("click", handleRedFlagPresent);

  el("no-red-flags-btn").addEventListener("click", () => {
    appState.history.push({
      question: "Red Flags Check",
      answer: "None present"
    });
    el("red-flags-container").classList.add("hidden");
    renderCurrentQuestion();
  });

  el("copy-summary-btn").addEventListener("click", async () => {
    const summary = el("summary-text").textContent ?? "";

    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = summary;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    const toast = el("toast-notification");
    toast.classList.remove("opacity-0", "translate-y-2");
    window.setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
    }, 2000);
  });
});
