import {
  pathwayCatalog,
  referenceCatalog,
  sharedReferenceBlocks
} from "@msk/msk-content";
import { describe, expect, it } from "vitest";

describe("content validation", () => {
  it("covers all eight acute pathways", () => {
    expect(pathwayCatalog).toHaveLength(8);
  });

  it("ensures every pathway has validated rule content", () => {
    for (const pathway of pathwayCatalog) {
      expect(pathway.decisionNodes.length).toBeGreaterThan(0);
      expect(pathway.conditions.length).toBeGreaterThan(0);
      expect(pathway.profileTemplates.length).toBeGreaterThan(0);
      expect(pathway.defaultDifferentials.length).toBeGreaterThan(0);
    }
  });

  it("ensures every cited reference resolves in the catalog", () => {
    const ids = new Set(referenceCatalog.map((reference) => reference.id));

    for (const pathway of pathwayCatalog) {
      for (const rule of pathway.redFlags) {
        for (const citation of rule.citations) {
          expect(ids.has(citation)).toBe(true);
        }
      }

      for (const rule of pathway.imagingRules) {
        for (const citation of rule.citations) {
          expect(ids.has(citation)).toBe(true);
        }
      }

      for (const rule of pathway.referralRules) {
        for (const citation of rule.citations) {
          expect(ids.has(citation)).toBe(true);
        }
      }

      for (const condition of pathway.conditions) {
        for (const citation of condition.citations) {
          expect(ids.has(citation)).toBe(true);
        }
      }
    }
  });

  it("ensures shared blocks are available for rule attachment", () => {
    const ids = new Set(sharedReferenceBlocks.map((block) => block.id));
    expect(ids.has("weight-bearing-status")).toBe(true);
    expect(ids.has("septic-crystal-warning")).toBe(true);
    expect(ids.has("vascular-injury")).toBe(true);
    expect(ids.has("nail-injury-management")).toBe(true);
  });
});
