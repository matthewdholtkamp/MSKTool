import React from "react";
import { createRoot } from "react-dom/client";
import { MskReferralApp } from "../apps/msk-referral/components/msk-referral-app";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root container for MSKTool.");
}

createRoot(container).render(
  <React.StrictMode>
    <MskReferralApp />
  </React.StrictMode>
);
