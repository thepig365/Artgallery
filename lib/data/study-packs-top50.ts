export interface StudyPack {
  slug: string;
  name: string;
  shortBlurb: string;
  officialLinks: Array<{ label: string; url: string }>;
  protocolTips: { B: string; P: string; M: string; S: string };
}

export const STUDY_PACKS_TOP50: StudyPack[] = [
  {
    slug: "munch",
    name: "Edvard Munch",
    shortBlurb:
      "Norwegian painter whose raw, emotionally charged imagery — most famously The Scream — helped launch Expressionism and remains a touchstone for art about psychological extremity.",
    officialLinks: [
      { label: "The Met collection search", url: "https://www.metmuseum.org/art/collection/search?q=Edvard+Munch" },
      { label: "Art Institute of Chicago search", url: "https://www.artic.edu/search?q=Edvard+Munch" },
      { label: "Munch Museum (Oslo)", url: "https://www.munchmuseet.no/en/" },
    ],
    protocolTips: {
      B: "Munch often applied paint thinly and rapidly, sometimes on unprimed cardboard. Look for visible ground through paint layers — a deliberate technique, not damage.",
      P: "Many Munch works remained in the artist's estate until bequeathed to Oslo. Ownership history should trace through Munchmuseet or documented dealer sales.",
      M: "Oil on canvas and cardboard are most common. He also produced a significant body of prints (lithographs, woodcuts) that have their own authentication considerations.",
      S: "Early works (pre-1900) are darker and more narrative; mature work becomes increasingly simplified and color-driven. His late paintings (1920s–40s) are often underappreciated.",
    },
  },
  {
    slug: "klee",
    name: "Paul Klee",
    shortBlurb:
      "Swiss-German Bauhaus master who merged childlike pictorial invention with sophisticated color theory, creating a unique visual language between abstraction and figuration.",
    officialLinks: [
      { label: "The Met collection search", url: "https://www.metmuseum.org/art/collection/search?q=Paul+Klee" },
      { label: "Art Institute of Chicago search", url: "https://www.artic.edu/search?q=Paul+Klee" },
      { label: "Zentrum Paul Klee (Bern)", url: "https://www.zpk.org/en/" },
    ],
    protocolTips: {
      B: "Klee's technique varies enormously — from delicate watercolor washes to oil transfer drawings to thick impasto. Consistent technique within a single work is the key indicator.",
      P: "The Paul Klee Foundation catalogue raisonné is the definitive reference. Works not catalogued require careful ownership documentation.",
      M: "Extraordinarily diverse: oil, watercolor, ink, paste, plaster, fabric, and combinations thereof. He frequently worked on unusual supports including burlap, muslin, and newspaper.",
      S: "Klee's oeuvre is vast (over 10,000 works) and stylistically varied. Period-specific analysis — Bauhaus geometric vs. late symbolic — is essential for evaluation.",
    },
  },
  {
    slug: "tiepolo",
    name: "Giovanni Battista Tiepolo",
    shortBlurb:
      "The last great Venetian painter, whose luminous ceiling frescoes and oil sketches represent the pinnacle of 18th-century Baroque decorative art.",
    officialLinks: [
      { label: "The Met collection search", url: "https://www.metmuseum.org/art/collection/search?q=Giovanni+Battista+Tiepolo" },
      { label: "Art Institute of Chicago search", url: "https://www.artic.edu/search?q=Tiepolo" },
    ],
    protocolTips: {
      B: "Tiepolo's oil sketches (bozzetti) show rapid, confident brushwork quite different from his finished frescoes. Both should exhibit luminous, airy handling.",
      P: "Many Tiepolo works are in situ (churches, palaces). Portable works should have clear ownership history from documented collections, especially given attribution confusion with his son Giandomenico.",
      M: "Fresco, oil on canvas, and pen-and-wash drawings are the primary media. His drawings are highly sought and frequently misattributed.",
      S: "Distinguish father (Giovanni Battista) from son (Giandomenico) — the father's work is airier and more luminous; the son's tends toward genre scenes with denser compositions.",
    },
  },
  {
    slug: "okeefe-study",
    name: "Georgia O'Keeffe",
    shortBlurb:
      "American modernist whose magnified flowers, bleached bones, and desert landscapes created a distinctly American visual language bridging representation and abstraction.",
    officialLinks: [
      { label: "The Met collection search", url: "https://www.metmuseum.org/art/collection/search?q=Georgia+O%27Keeffe" },
      { label: "Art Institute of Chicago search", url: "https://www.artic.edu/search?q=Georgia+O%27Keeffe" },
      { label: "Georgia O'Keeffe Museum", url: "https://www.okeeffemuseum.org/" },
    ],
    protocolTips: {
      B: "O'Keeffe's surfaces are smooth and meticulously finished — visible brushstrokes are rare in mature work. Heavy impasto or rough handling is inconsistent with her technique.",
      P: "The Georgia O'Keeffe Museum maintains the catalogue raisonné. Works should trace through Stieglitz gallery records, estate documentation, or verified dealer sales.",
      M: "Primarily oil on canvas. Early charcoal abstractions (1915–16) and pastels form an important secondary body. Watercolors exist but are less common.",
      S: "Charcoal abstractions (1910s), flowers (1920s), New Mexico landscapes and bones (1930s+), and late sky paintings (1960s) each have distinctive characteristics.",
    },
  },
  {
    slug: "hopper-study",
    name: "Edward Hopper",
    shortBlurb:
      "American realist whose scenes of urban isolation and stark light capture the psychological landscape of modern American life with cinematic precision.",
    officialLinks: [
      { label: "The Met collection search", url: "https://www.metmuseum.org/art/collection/search?q=Edward+Hopper" },
      { label: "Art Institute of Chicago search", url: "https://www.artic.edu/search?q=Edward+Hopper" },
      { label: "Whitney Museum of American Art", url: "https://whitney.org/collection/works?q=Edward+Hopper" },
    ],
    protocolTips: {
      B: "Hopper's paint handling is deliberate and economical — broad flat planes of color with precise edges. Loose or gestural handling is atypical.",
      P: "The Whitney Museum holds the largest Hopper collection (bequest from his wife). The Hopper catalogue raisonné by Gail Levin is the standard reference.",
      M: "Oil on canvas for major works; watercolors (especially Cape Cod scenes) form an important parallel body. Etchings from the 1910s–20s are also significant.",
      S: "Hopper's mature style (post-1925) is remarkably consistent. Dramatic shifts in approach within a purported date range are a warning sign.",
    },
  },
  {
    slug: "chagall-study",
    name: "Marc Chagall",
    shortBlurb:
      "Russian-French artist whose dreamlike, narrative imagery drew on Jewish folklore, love, and memory to create a poetic visual world that defies easy categorization.",
    officialLinks: [
      { label: "The Met collection search", url: "https://www.metmuseum.org/art/collection/search?q=Marc+Chagall" },
      { label: "Art Institute of Chicago search", url: "https://www.artic.edu/search?q=Marc+Chagall" },
      { label: "Musée National Marc Chagall (Nice)", url: "https://musees-nationaux-alpesmaritimes.fr/chagall/" },
    ],
    protocolTips: {
      B: "Chagall's brush handling ranges from thin, luminous glazes to thick impasto depending on period. His characteristic floating figures should feel weightless, not labored.",
      P: "The Chagall Committee (Comité Chagall) oversees authentication. Given the high volume of forgeries, works without Committee review carry elevated risk.",
      M: "Oil on canvas, gouache, stained glass, ceramics, and tapestry. His prints (lithographs for Vollard, Bible illustrations) are extensively catalogued.",
      S: "Russian period (pre-1922), Paris years, American exile (1941–48), and late Mediterranean period each have distinct palettes. Chagall's recurring motifs (fiddlers, lovers, animals) should feel organic, not formulaic.",
    },
  },
  {
    slug: "miro-study",
    name: "Joan Miró",
    shortBlurb:
      "Catalan artist whose biomorphic abstractions, vivid color, and playful visual language bridged Surrealism and abstraction with a distinctly Mediterranean joy.",
    officialLinks: [
      { label: "The Met collection search", url: "https://www.metmuseum.org/art/collection/search?q=Joan+Mir%C3%B3" },
      { label: "Art Institute of Chicago search", url: "https://www.artic.edu/search?q=Joan+Mir%C3%B3" },
      { label: "Fundació Joan Miró (Barcelona)", url: "https://www.fmirobcn.org/en/" },
    ],
    protocolTips: {
      B: "Miró's mature work combines spontaneous-looking gestures with careful planning. Preliminary drawings exist for most major paintings. The apparent simplicity conceals deliberate composition.",
      P: "The Miró catalogue raisonné (Jacques Dupin) and Successió Miró are key authentication references. Works should be traceable through documented galleries or estate records.",
      M: "Oil on canvas, gouache, collage, ceramics, bronze sculpture, and tapestry. His late 'burnt canvases' (1973) are a distinct sub-category requiring specialized knowledge.",
      S: "Detailed realism (pre-1924), Surrealist-period 'dream paintings' (1924–27), 'wild paintings' (1930s), and late monumental works differ significantly. Date-style coherence is essential.",
    },
  },
];

export function getStudyPackBySlug(slug: string): StudyPack | undefined {
  return STUDY_PACKS_TOP50.find((p) => p.slug === slug);
}
