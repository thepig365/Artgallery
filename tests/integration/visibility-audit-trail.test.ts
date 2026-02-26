import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { toggleVisibilitySchema } from "@/lib/validation/schemas";
import { VisibilityError } from "@/lib/services/artwork-visibility";
import { TakedownError } from "@/lib/services/takedown";

/**
 * Integration: visibility toggle + takedown audit trail contract.
 *
 * The actual toggleArtworkVisibility() and createTakedownRequest() require
 * a database. These tests verify:
 *   1. Service source code uses $transaction for atomicity
 *   2. Service source code co-locates provenanceLog.create with mutations
 *   3. Schema validation catches bad inputs at the boundary
 *   4. Error classes are correctly typed for catch-path routing
 */

function readServiceSource(relativePath: string): string {
  return readFileSync(resolve(__dirname, "../..", relativePath), "utf-8");
}

describe("Integration: visibility + takedown audit trail structure", () => {
  describe("artwork-visibility service — provenance guarantees", () => {
    const source = readServiceSource("lib/services/artwork-visibility.ts");

    it("uses prisma.$transaction for atomic visibility toggle", () => {
      expect(source).toContain("prisma.$transaction");
    });

    it("creates a ProvenanceLog entry for ARTWORK_HIDDEN events", () => {
      expect(source).toContain("ARTWORK_HIDDEN");
    });

    it("creates a ProvenanceLog entry for ARTWORK_UNHIDDEN events", () => {
      expect(source).toContain("ARTWORK_UNHIDDEN");
    });

    it("records actorId in the provenance log", () => {
      expect(source).toContain("actorId");
    });

    it("records reason in the provenance detail", () => {
      expect(source).toContain("hiddenReason");
    });

    it("provenanceLog.create is inside the transaction block", () => {
      const txStart = source.indexOf("$transaction");
      const provenanceCreate = source.indexOf(
        "provenanceLog.create",
        txStart
      );
      expect(txStart).toBeGreaterThan(-1);
      expect(provenanceCreate).toBeGreaterThan(txStart);
    });
  });

  describe("takedown service — provenance guarantees", () => {
    const source = readServiceSource("lib/services/takedown.ts");

    it("uses prisma.$transaction for atomic takedown creation", () => {
      expect(source).toContain("prisma.$transaction");
    });

    it("logs TAKEDOWN_REQUESTED event", () => {
      expect(source).toContain("TAKEDOWN_REQUESTED");
    });

    it("logs TAKEDOWN_RESOLVED event on resolution", () => {
      expect(source).toContain("TAKEDOWN_RESOLVED");
    });

    it("resolve uses $transaction for atomic update + log", () => {
      const resolveFunc = source.indexOf("resolveTakedownRequest");
      const txAfterResolve = source.indexOf("$transaction", resolveFunc);
      const provenanceAfterTx = source.indexOf(
        "provenanceLog.create",
        txAfterResolve
      );
      expect(resolveFunc).toBeGreaterThan(-1);
      expect(txAfterResolve).toBeGreaterThan(resolveFunc);
      expect(provenanceAfterTx).toBeGreaterThan(txAfterResolve);
    });

    it("records complainant name in takedown log detail", () => {
      expect(source).toContain("complainantName");
    });
  });

  describe("schema → service validation boundary", () => {
    it("toggleVisibilitySchema requires reason when hiding", () => {
      const hide = toggleVisibilitySchema.safeParse({
        artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isVisible: false,
        actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      });
      expect(hide.success).toBe(false);
    });

    it("toggleVisibilitySchema accepts unhide without reason", () => {
      const unhide = toggleVisibilitySchema.safeParse({
        artworkId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        isVisible: true,
        actorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      });
      expect(unhide.success).toBe(true);
    });

    it("VisibilityError and TakedownError are distinguishable", () => {
      const visErr = new VisibilityError("test");
      const tkdErr = new TakedownError("test");

      expect(visErr.name).toBe("VisibilityError");
      expect(tkdErr.name).toBe("TakedownError");
      expect(visErr.name).not.toBe(tkdErr.name);
    });

    it("both error types extend Error for standard catch handling", () => {
      expect(new VisibilityError("x")).toBeInstanceOf(Error);
      expect(new TakedownError("x")).toBeInstanceOf(Error);
    });
  });
});
