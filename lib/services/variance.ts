/**
 * Variance flag logic — when >=2 submitted scores exist and deltas exceed threshold.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "./audit-log";

const AXIS_THRESHOLD = 2.0;
const TOTAL_THRESHOLD = 1.5;

export async function checkAndFlagVariance(artworkId: string): Promise<void> {
  const scores = await prisma.assessmentScore.findMany({
    where: { artworkId, status: "SUBMITTED" },
  });

  if (scores.length < 2) return;

  const toNum = (v: unknown) =>
    typeof v === "object" && v !== null && "toNumber" in v
      ? (v as { toNumber: () => number }).toNumber()
      : Number(v);

  let maxAxisDelta = 0;
  let maxTotalDelta = 0;

  for (let i = 0; i < scores.length; i++) {
    for (let j = i + 1; j < scores.length; j++) {
      const a = scores[i];
      const b = scores[j];
      const dB = Math.abs(toNum(a.scoreB) - toNum(b.scoreB));
      const dP = Math.abs(toNum(a.scoreP) - toNum(b.scoreP));
      const dM = Math.abs(toNum(a.scoreM) - toNum(b.scoreM));
      const dS = Math.abs(toNum(a.scoreS) - toNum(b.scoreS));
      const axisMax = Math.max(dB, dP, dM, dS);
      const totalDelta = Math.abs(toNum(a.totalScore) - toNum(b.totalScore));
      if (axisMax > maxAxisDelta) maxAxisDelta = axisMax;
      if (totalDelta > maxTotalDelta) maxTotalDelta = totalDelta;
    }
  }

  const shouldFlag =
    maxAxisDelta >= AXIS_THRESHOLD || maxTotalDelta >= TOTAL_THRESHOLD;

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
  });
  if (!artwork) return;

  const current = artwork.varianceFlag ?? false;

  if (shouldFlag) {
    const scoreIds = scores.map((s) => s.id);
    const varianceMeta = {
      maxAxisDelta,
      maxTotalDelta,
      scoreIds,
      scoreCount: scores.length,
      thresholdAxis: AXIS_THRESHOLD,
      thresholdTotal: TOTAL_THRESHOLD,
    };

    await prisma.artwork.update({
      where: { id: artworkId },
      data: { varianceFlag: true, varianceMeta: varianceMeta as object },
    });
    await writeAuditLog({
      actorAuthUid: "system",
      actorRole: "system",
      action: "VARIANCE_FLAG",
      entityType: "artwork",
      entityId: artworkId,
      meta: varianceMeta,
    });
  } else if (!shouldFlag && current) {
    await prisma.artwork.update({
      where: { id: artworkId },
      data: { varianceFlag: false, varianceMeta: Prisma.DbNull },
    });
  }
}
