export interface ModernMaster {
  slug: string;
  name: string;
  institution: string;
  official: string;
  blurb: string;
  why: string;
  phases: Array<{ title: string; description: string }>;
  mendTips: { B: string; P: string; M: string; S: string };
}

export const MODERN_MASTERS_DATA: ModernMaster[] = [
  {
    slug: "picasso",
    name: "Pablo Picasso",
    institution: "MoMA",
    official: "https://www.moma.org/collection/artists/4609",
    blurb:
      "Pioneer of Cubism and one of the most influential artists of the 20th century, Picasso's restless experimentation redefined modern art.",
    why: `Pablo Picasso (1881–1973) matters because he shattered the conventions of Western representation and rebuilt them from the ground up — not once, but repeatedly across seven decades. His invention of Cubism with Georges Braque dismantled single-point perspective, proposing that objects could be seen from multiple angles simultaneously. This was not mere stylistic play; it was a fundamental reconception of how humans perceive and represent reality.\n\nBeyond Cubism, Picasso moved through Blue and Rose periods, Surrealist-inflected distortion, ceramic work, and monumental political painting. "Guernica" (1937) remains the most powerful anti-war image in Western art, proving that formal radicalism and moral urgency can coexist. His prolificacy — over 50,000 works across painting, sculpture, printmaking, and ceramics — ensures that no single style contains him, making him a permanent case study in creative reinvention.`,
    phases: [
      {
        title: "Les Demoiselles d'Avignon (1907)",
        description:
          "Five figures rendered with fractured planes and African-mask-inspired faces. This canvas detonated classical composition and is widely considered the opening shot of modern art.",
      },
      {
        title: "Guernica (1937)",
        description:
          "A monumental grisaille depicting the bombing of a Basque town during the Spanish Civil War. Its writhing forms compress agony into a single picture plane without resorting to photographic realism.",
      },
      {
        title: "The Bull (1945–46, lithograph series)",
        description:
          "Eleven progressive states reducing a realistic bull to a few essential lines. A masterclass in abstraction-as-editing, frequently used in design pedagogy.",
      },
    ],
    mendTips: {
      B: "Look for evidence of physical reworking: pentimenti, scraping, overpainting. Picasso frequently revised on-canvas, and authentic works show material density.",
      P: "Provenance chains for Picasso are heavily documented. Any gap between 1930–1960 warrants scrutiny given wartime looting risks.",
      M: "Expect wide medium diversity — oil, gouache, crayon, collage on single surfaces. Material inconsistency within a work is normal; absence of it can be suspicious.",
      S: "Stylistic range is extreme. A 1907 work should not resemble a 1925 work. Date-style mismatches are a strong signal.",
    },
  },
  {
    slug: "joan-mitchell",
    name: "Joan Mitchell",
    institution: "Joan Mitchell Foundation",
    official:
      "https://www.joanmitchellfoundation.org/joan-mitchell/rights-reproductions",
    blurb:
      "A leading second-generation Abstract Expressionist whose large-scale canvases translated landscape memory into visceral color fields.",
    why: `Joan Mitchell (1925–1992) extended the ambitions of first-generation Abstract Expressionism while charting a distinctly personal course rooted in remembered landscape. Working primarily in Paris and Vétheuil from the 1960s onward, she painted enormous multi-panel canvases whose lashing brushwork registers both fury and tenderness.\n\nMitchell insisted on painting from feelings about landscape rather than from direct observation, creating what she called "remembered landscapes." Her palette — sunflower yellows, cerulean blues, viridian greens — carries the sensory weight of actual fields and rivers without depicting them. Unlike many peers, she refused Minimalism's reduction and Pop Art's irony, maintaining that painterly gesture and color could still communicate complex emotional states. Her late triptychs rank among the most ambitious Abstract Expressionist works by any artist of the second half of the 20th century.`,
    phases: [
      {
        title: "City Landscape (1955)",
        description:
          "An early breakthrough fusing urban energy with painterly abstraction. Dense brushwork builds a scaffolding of color that evokes skyscraper rhythms without depicting them.",
      },
      {
        title: "La Grande Vallée Series (1983–84)",
        description:
          "A monumental multi-canvas cycle inspired by Monet's late water lilies. Mitchell translated garden memory into explosive color chords spanning up to four panels.",
      },
      {
        title: "Chord VII (1987)",
        description:
          "A late large-scale diptych where chromatic intensity reaches near-violent levels. The paint surface oscillates between controlled gesture and liberated accident.",
      },
    ],
    mendTips: {
      B: "Mitchell's paint application is physically intense — heavy impasto, visible dragging, and squeeze-from-tube passages. Flat or tentative surfaces are inconsistent.",
      P: "The Joan Mitchell Foundation maintains an authentication process. Works without Foundation review after 2016 require extra diligence.",
      M: "Predominantly oil on canvas. She rarely mixed media types. Works on paper are smaller-scale and use pastel or watercolor.",
      S: "Scale matters: mature Mitchell works are typically very large (often >6 feet). Small 'Mitchell-style' paintings warrant skepticism unless documented as studies.",
    },
  },
  {
    slug: "rothko",
    name: "Mark Rothko",
    institution: "Tate",
    official: "https://www.tate.org.uk/art/artists/mark-rothko-1875",
    blurb:
      "Master of luminous color-field painting whose soft-edged rectangles aim to evoke fundamental human emotions — tragedy, ecstasy, doom.",
    why: `Mark Rothko (1903–1970) pursued a singular vision: painting as a vehicle for direct emotional experience. By the late 1940s he had shed figuration entirely, arriving at his signature format of stacked, soft-edged rectangles of luminous color hovering on a tinted ground.\n\nThese canvases are deceptively simple. Up close, their surfaces reveal dozens of translucent glazes — thin washes of pigment layered to produce an inner glow that no reproduction captures. Rothko intended them to be encountered at close range in dim lighting, surrounding the viewer in color the way architecture surrounds the body. His Houston Chapel (1971), with its near-black panels, represents the logical endpoint: painting reduced to pure contemplative presence. The emotional range from early radiant works (oranges, yellows) to late somber ones (maroons, blacks) charts one of art history's most profound internal journeys.`,
    phases: [
      {
        title: "No. 61 (Rust and Blue) (1953)",
        description:
          "A classic mid-career format: two luminous rectangles — warm rust above cool blue — float on a narrow ground. The edges breathe, creating an optical pulse between form and field.",
      },
      {
        title: "Seagram Murals (1958–59)",
        description:
          "Commissioned for the Four Seasons restaurant, Rothko produced a cycle of dark, horizontally-banded paintings. He ultimately withdrew, donating them to the Tate, declaring the space incompatible with contemplation.",
      },
      {
        title: "Rothko Chapel Panels (1964–67)",
        description:
          "Fourteen near-monochrome panels — dark plum, black, maroon — installed in a non-denominational chapel in Houston. They represent the furthest reach of his reductive ambition.",
      },
    ],
    mendTips: {
      B: "Rothko's surfaces are extremely fragile — thin glazes over raw or lightly primed canvas. Cracking patterns and paint absorption into canvas weave are normal age indicators.",
      P: "The Rothko estate and catalogue raisonné (published by Yale/NGA) are key references. Undocumented works appearing after 1985 carry high risk.",
      M: "Oil and sometimes acrylic on canvas, occasionally paper. He used egg-oil emulsions and dammar varnish in complex layering. Infrared examination often reveals underlayers.",
      S: "Pre-1949 figurative/surrealist works look completely different from mature abstractions. Transitional 'multiform' pieces (1947–49) bridge the gap.",
    },
  },
  {
    slug: "warhol",
    name: "Andy Warhol",
    institution: "The Andy Warhol Museum",
    official: "https://www.warhol.org/",
    blurb:
      "Pop Art icon who collapsed the boundary between commercial and fine art, using silkscreen repetition to interrogate mass culture and celebrity.",
    why: `Andy Warhol (1928–1987) transformed art's relationship to commerce, celebrity, and mechanical reproduction. His silkscreen paintings of Campbell's Soup cans (1962) and Marilyn Monroe (1962) didn't merely depict consumer culture — they adopted its production methods, flattening the distinction between unique artwork and mass-produced commodity.\n\nThis was conceptually radical. Where Abstract Expressionists prized the individual mark as evidence of authenticity, Warhol delegated execution to assistants in his "Factory," asking whether authorship even mattered. His serial imagery — car crashes, electric chairs, celebrities — used repetition to oscillate between numbing and sensitizing the viewer. Late works like the Oxidation and Shadow paintings pushed process further, introducing chance (literal chemistry) into image-making. Warhol's influence extends far beyond painting into film, music, publishing, and the entire machinery of contemporary art-world celebrity.`,
    phases: [
      {
        title: "Campbell's Soup Cans (1962)",
        description:
          "Thirty-two canvases, each depicting a different soup flavor. The gesture of painting a grocery-shelf item at gallery scale was both deadpan and devastating to prevailing notions of artistic subject matter.",
      },
      {
        title: "Death and Disaster Series (1962–64)",
        description:
          "Silkscreened news photos of car crashes, suicides, and electric chairs. Repetition bleaches shock into pattern, forcing viewers to confront their own desensitization.",
      },
      {
        title: "Oxidation Paintings (1977–78)",
        description:
          "Created by urinating on canvases primed with metallic paint, producing iridescent chemical reactions. A pointed rebuke to painterly reverence and a serious material experiment.",
      },
    ],
    mendTips: {
      B: "Silkscreen works should show characteristic mesh patterns, ink density variations, and registration shifts. Perfectly uniform prints are suspect.",
      P: "The Andy Warhol Foundation Authentication Board disbanded in 2011. Provenance must now be established through dealer records, exhibition history, and the catalogue raisonné.",
      M: "Acrylic and silkscreen ink on canvas (paintings), various print media (editions). Factory production means multiple versions of an image may exist — edition vs. unique matters enormously.",
      S: "Warhol's range includes hand-drawn 1950s commercial illustrations, 1960s Pop silkscreens, 1970s portraits, and 1980s collaborations. Each period has distinct market valuation.",
    },
  },
  {
    slug: "kandinsky",
    name: "Vasily Kandinsky",
    institution: "Guggenheim",
    official:
      "https://www.guggenheim.org/artwork/artist/vasily-kandinsky",
    blurb:
      "Theorist and painter who pioneered pure abstraction, arguing that color and form could communicate spiritual states independently of representation.",
    why: `Vasily Kandinsky (1866–1944) is widely credited with producing some of the earliest purely abstract paintings, around 1910–13. But his importance goes beyond chronological priority. He built a theoretical framework — articulated in "Concerning the Spiritual in Art" (1911) and "Point and Line to Plane" (1926) — that gave abstraction intellectual legitimacy at a time when it was dismissed as decoration.\n\nKandinsky proposed systematic correspondences between visual elements (color, line, shape) and psychological or spiritual effects, drawing parallels with musical composition. His Munich-period "Compositions" and "Improvisations" are explosive, multi-colored canvases that feel genuinely unmoored from representation. His later Bauhaus and Paris periods shifted toward geometric precision — circles, grids, biomorphic forms — yet maintained the conviction that visual art could operate like music: non-representationally, directly on the senses. This idea underwrites nearly all subsequent abstract art.`,
    phases: [
      {
        title: "Composition VII (1913)",
        description:
          "Perhaps the most complex of Kandinsky's Munich-period abstractions. A swirling vortex of color and line resists any single focal point, forcing the eye to move continuously across the surface.",
      },
      {
        title: "Several Circles (1926)",
        description:
          "A Bauhaus-era work where overlapping circles of varying size and transparency float on a deep dark ground. Geometric precision replaces the earlier expressionist turbulence.",
      },
      {
        title: "Composition X (1939)",
        description:
          "A late Paris-period painting combining biomorphic shapes with geometric elements against a black ground. The vocabulary has shifted but the ambition — painting as visual music — remains.",
      },
    ],
    mendTips: {
      B: "Munich-period works show thick, expressive application; Bauhaus works are smoother, more controlled. Physical handling should match the period.",
      P: "The Kandinsky catalogue raisonné by Roethel and Benjamin is the standard reference. Works not included require careful vetting.",
      M: "Oil on canvas (Munich), oil and sometimes mixed media on board (Bauhaus), oil on canvas (Paris). Watercolors and gouaches on paper form a large parallel body.",
      S: "Three distinct phases (Munich expressionist, Bauhaus geometric, Paris biomorphic) are visually quite different. Misattributing period is a common error.",
    },
  },
  {
    slug: "georgia-okeeffe",
    name: "Georgia O'Keeffe",
    institution: "Georgia O'Keeffe Museum",
    official: "https://www.okeeffemuseum.org/",
    blurb:
      "American modernist who magnified flowers, bones, and desert landscapes into near-abstract meditations on form and perception.",
    why: `Georgia O'Keeffe (1887–1986) developed a visual language that bridged representation and abstraction more seamlessly than almost any American artist. Her famous magnified flowers — painted so large that viewers are forced inside them — strip botanical subjects of sentimental associations, revealing them as pure arrangements of curve, color, and edge.\n\nO'Keeffe's New Mexico landscapes (from the 1930s onward) perform a similar operation on terrain: mesas, sky, and bone become flattened planes of color that recall Precisionist geometry while retaining the specificity of place. Her career-long insistence on her own vision — refusing to accept Freudian readings imposed by critics, maintaining artistic independence from her husband Alfred Stieglitz's circle — also made her a model for artistic self-determination. Her influence on American Modernism, feminist art discourse, and the visual identity of the American Southwest remains immense.`,
    phases: [
      {
        title: "Black Iris III (1926)",
        description:
          "A magnified iris rendered in deep purples and blacks. The petals fill the canvas entirely, transforming a flower into an abstract study of concentric organic forms.",
      },
      {
        title: "Cow's Skull: Red, White, and Blue (1931)",
        description:
          "A bleached skull centered against bands of color echoing the American flag. O'Keeffe reclaimed the skull as a symbol of desert vitality rather than death.",
      },
      {
        title: "Sky Above Clouds IV (1965)",
        description:
          "A 24-foot-wide canvas depicting an aerial cloud field receding to the horizon. The largest work she ever made, it oscillates between landscape and geometric pattern.",
      },
    ],
    mendTips: {
      B: "O'Keeffe's surfaces are smooth and meticulously finished — visible brushstrokes are rare. Works with heavy impasto or rough handling are inconsistent.",
      P: "The Georgia O'Keeffe Museum maintains the catalogue raisonné. Works should be traceable through Stieglitz gallery records, estate records, or documented sales.",
      M: "Primarily oil on canvas. Pastels and charcoals (especially early abstractions from the 1910s) and watercolors form a secondary body.",
      S: "Charcoal abstractions (1915–16), magnified flowers (1920s), New Mexico landscapes and bones (1930s+), and late sky/cloud paintings (1960s) each have distinctive palettes and forms.",
    },
  },
];

export function getMasterBySlug(slug: string): ModernMaster | undefined {
  return MODERN_MASTERS_DATA.find((m) => m.slug === slug);
}
