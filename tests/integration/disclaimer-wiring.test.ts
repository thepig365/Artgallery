import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { DISCLAIMERS } from "@/lib/compliance/disclaimers";

/**
 * Integration: verifies that each required disclaimer key is actually
 * referenced in the appropriate page/component source files.
 *
 * This is a lightweight source-level check — it asserts that the source
 * text of each page file contains the expected DISCLAIMERS.key reference,
 * catching accidental removal during refactors.
 */

function readSource(relativePath: string): string {
  return readFileSync(resolve(__dirname, "../..", relativePath), "utf-8");
}

describe("Integration: disclaimer wiring presence", () => {
  describe("DISCLAIMERS.global", () => {
    it("is referenced in SiteFooter", () => {
      const source = readSource("components/layout/SiteFooter.tsx");
      expect(source).toContain("DISCLAIMERS.global");
    });

    it("is referenced in Protocol page", () => {
      const source = readSource("app/protocol/page.tsx");
      expect(source).toContain("DISCLAIMERS.global");
    });
  });

  describe("DISCLAIMERS.report", () => {
    it("is referenced in assessor session page", () => {
      const source = readSource(
        "app/portal/assessor/session/[auditSessionId]/page.tsx"
      );
      expect(source).toContain("DISCLAIMERS.report");
    });

    it("is referenced in submit confirmation", () => {
      const source = readSource(
        "components/portal/SubmissionSuccess.tsx"
      );
      expect(source).toContain("DISCLAIMERS.report");
    });

    it("is referenced in archive detail page", () => {
      const source = readSource("app/archive/[slug]/page.tsx");
      expect(source).toContain("DISCLAIMERS.report");
    });

    it("is referenced in archive list page", () => {
      const source = readSource("app/archive/page.tsx");
      expect(source).toContain("DISCLAIMERS.report");
    });
  });

  describe("DISCLAIMERS.submissionConsent", () => {
    it("is referenced in StepConsent component", () => {
      const source = readSource("components/portal/StepConsent.tsx");
      expect(source).toContain("DISCLAIMERS.submissionConsent");
    });
  });

  describe("DISCLAIMERS.assessorDisclosure", () => {
    it("is referenced in assessor session page", () => {
      const source = readSource(
        "app/portal/assessor/session/[auditSessionId]/page.tsx"
      );
      expect(source).toContain("DISCLAIMERS.assessorDisclosure");
    });
  });

  describe("DISCLAIMERS.takedownDeclaration", () => {
    it("is referenced in takedown request page", () => {
      const source = readSource("app/takedown/page.tsx");
      expect(source).toContain("DISCLAIMERS.takedownDeclaration");
    });
  });

  describe("all disclaimer keys are non-empty strings", () => {
    const keys = Object.keys(DISCLAIMERS) as Array<keyof typeof DISCLAIMERS>;

    for (const key of keys) {
      it(`DISCLAIMERS.${key} is a non-empty string`, () => {
        expect(typeof DISCLAIMERS[key]).toBe("string");
        expect(DISCLAIMERS[key].length).toBeGreaterThan(20);
      });
    }
  });

  describe("every disclaimer key has at least one page reference", () => {
    const sourceFiles = [
      "components/layout/SiteFooter.tsx",
      "app/protocol/page.tsx",
      "app/portal/assessor/session/[auditSessionId]/page.tsx",
      "app/portal/submit/page.tsx",
      "app/archive/page.tsx",
      "app/archive/[slug]/page.tsx",
      "app/takedown/page.tsx",
      "components/portal/StepConsent.tsx",
    ];

    const allSources = sourceFiles.map(readSource).join("\n");

    const keys = Object.keys(DISCLAIMERS) as Array<keyof typeof DISCLAIMERS>;

    for (const key of keys) {
      it(`DISCLAIMERS.${key} is referenced in at least one page source`, () => {
        expect(allSources).toContain(`DISCLAIMERS.${key}`);
      });
    }
  });
});
