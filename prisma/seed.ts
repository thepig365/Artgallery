import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Artists ────────────────────────────────────────────
  const artist1 = await prisma.artist.upsert({
    where: { slug: "elena-vasquez" },
    update: {},
    create: {
      name: "Elena Vasquez",
      slug: "elena-vasquez",
      bio: "Mixed-media artist working with found materials and iron oxide pigments.",
      website: "https://elenavasquez.example.com",
    },
  });

  const artist2 = await prisma.artist.upsert({
    where: { slug: "marcus-chen" },
    update: {},
    create: {
      name: "Marcus Chen",
      slug: "marcus-chen",
      bio: "Sculptor and installation artist exploring material entropy.",
    },
  });

  const artist3 = await prisma.artist.upsert({
    where: { slug: "sofia-amari" },
    update: {},
    create: {
      name: "Sofia Amari",
      slug: "sofia-amari",
      bio: "Textile artist focused on natural dye processes and woven narratives.",
    },
  });

  // ── Artworks ───────────────────────────────────────────
  const artwork1 = await prisma.artwork.upsert({
    where: { slug: "erosion-study-no-7" },
    update: {},
    create: {
      title: "Erosion Study No. 7",
      slug: "erosion-study-no-7",
      medium: "Oil and iron oxide on raw linen",
      year: 2024,
      dimensions: "48 × 36 in",
      materials: "Oil pigment, cold wax, iron oxide, raw linen",
      narrative:
        "An investigation into material degradation as an expressive force. The surface is built through successive layers of oil and wax, punctuated by iron oxide deposits that bleed into the linen ground.",
      sourceUrl: "https://source.example.com/erosion-study-7",
      imageUrl: "https://images.example.com/erosion-study-7.jpg",
      sourceLicenseStatus: "CC BY-NC 4.0",
      scoreB: 7.2,
      scoreP: 8.1,
      scoreM: 6.5,
      scoreS: 7.8,
      finalV: 7.24,
      isVisible: true,
      artistId: artist1.id,
    },
  });

  const artwork2 = await prisma.artwork.upsert({
    where: { slug: "compression-field-ii" },
    update: {},
    create: {
      title: "Compression Field II",
      slug: "compression-field-ii",
      medium: "Welded steel and concrete",
      year: 2023,
      dimensions: "72 × 24 × 24 in",
      materials: "Corten steel, portland cement, rebar",
      narrative:
        "A freestanding column exploring the tension between rigid industrial materials and their inevitable oxidation. The concrete core is intentionally cracked to reveal the internal structure.",
      isVisible: true,
      artistId: artist2.id,
    },
  });

  const artwork3 = await prisma.artwork.upsert({
    where: { slug: "indigo-memory-cloth" },
    update: {},
    create: {
      title: "Indigo Memory Cloth",
      slug: "indigo-memory-cloth",
      medium: "Natural indigo on handwoven cotton",
      year: 2024,
      dimensions: "60 × 40 in",
      materials: "Handwoven cotton, natural indigo, iron mordant",
      isVisible: false,
      hiddenReason: "Pending provenance verification",
      hiddenAt: new Date(),
      artistId: artist3.id,
    },
  });

  // ── Assessor Users ─────────────────────────────────────
  const admin = await prisma.assessorUser.upsert({
    where: { email: "admin@artprotocol.dev" },
    update: {},
    create: {
      email: "admin@artprotocol.dev",
      name: "System Admin",
      role: "ADMIN",
    },
  });

  const assessor1 = await prisma.assessorUser.upsert({
    where: { email: "assessor1@artprotocol.dev" },
    update: {},
    create: {
      email: "assessor1@artprotocol.dev",
      name: "Dr. Anya Petrova",
      role: "ASSESSOR",
    },
  });

  const assessor2 = await prisma.assessorUser.upsert({
    where: { email: "assessor2@artprotocol.dev" },
    update: {},
    create: {
      email: "assessor2@artprotocol.dev",
      name: "James Whitfield",
      role: "ASSESSOR",
    },
  });

  // ── Audit Session ──────────────────────────────────────
  const session = await prisma.auditSession.create({
    data: {
      artworkId: artwork1.id,
      phase: "BLIND_SCORING",
      status: "IN_PROGRESS",
      notes: "Initial blind assessment round for Erosion Study No. 7",
    },
  });

  // ── Audit Scores ───────────────────────────────────────
  await prisma.auditScore.create({
    data: {
      auditSessionId: session.id,
      assessorUserId: assessor1.id,
      scoreB: 7.5,
      scoreP: 8.0,
      scoreM: 6.8,
      scoreS: 7.6,
      finalV: 7.32,
      notes: "Strong material presence. Provenance documentation is thorough.",
    },
  });

  await prisma.auditScore.create({
    data: {
      auditSessionId: session.id,
      assessorUserId: assessor2.id,
      scoreB: 6.9,
      scoreP: 8.2,
      scoreM: 6.2,
      scoreS: 8.0,
      finalV: 7.18,
      notes: "Surface treatment is compelling but material sourcing could be better documented.",
    },
  });

  // ── Provenance Logs ────────────────────────────────────
  await prisma.provenanceLog.create({
    data: {
      eventType: "ARTWORK_CREATED",
      artworkId: artwork1.id,
      actorId: admin.id,
      detail: "Artwork submitted and catalogued",
    },
  });

  await prisma.provenanceLog.create({
    data: {
      eventType: "AUDIT_SESSION_CREATED",
      artworkId: artwork1.id,
      actorId: admin.id,
      detail: "Blind scoring session initiated",
    },
  });

  await prisma.provenanceLog.create({
    data: {
      eventType: "ARTWORK_HIDDEN",
      artworkId: artwork3.id,
      actorId: admin.id,
      detail: "Artwork hidden: Pending provenance verification",
      metadata: { isVisible: false, reason: "Pending provenance verification" },
    },
  });

  console.log("Seed complete.");
  console.log({
    artists: [artist1.slug, artist2.slug, artist3.slug],
    artworks: [artwork1.slug, artwork2.slug, artwork3.slug],
    assessors: [admin.email, assessor1.email, assessor2.email],
    sessions: 1,
  });
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
