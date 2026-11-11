// All product copy lives here. Everything below is taken from the existing Aether Studio
// app unless marked NEW (structure labels and Aiko's guide lines, which restate existing copy).

export const APP_URL = "https://aether-studio-5eab0.web.app/";

export const hero = {
  lead: "Create",
  words: ["Anything.", "Art.", "Dreams.", "Magic.", "Worlds."],
  body: "Aether Studio is your AI-powered creative universe. Generate stunning images, enhance prompts, and let Aiko guide your creativity.",
  primary: "Start Creating Free",
  secondary: "Explore Features",
  note: "Powered by AI. Free to use.",
};

export const studio = {
  title: "Convert your shadows into reality",
  body: "Describe your vision and let AI bring it to life.",
  prompt: "A lone samurai at sunset, cherry blossoms falling...",
  nav: ["Generator", "History", "Crop & Resize", "Upscale"],
  ratios: ["1:1", "4:3", "16:9"],
  empty: "Your imagination, rendered",
  busy: "Crafting your masterpiece",
  caption: "Illustration of the studio. The picture is drawn for this page, not generated.",
};

export const numbers = [
  { value: "9", label: "AI art styles" },
  { value: "6", label: "director modes" },
  { value: "40+", label: "knowledge entries" },
  { value: "∞", label: "creative possibilities" },
];

export const featuresTitle = "Built for Creators, Powered by AI";

// Chapter names are NEW; the nine features and their descriptions are verbatim.
export const chapters = [
  {
    id: "create",
    name: "Create",
    items: [
      {
        title: "AI Image Generation",
        body: "Generate stunning images from text using Cloudflare AI — Photorealistic, Anime, Digital Art across 9 styles.",
      },
      {
        title: "Director Mode",
        body: "Channel Nolan, Kubrick, Ghibli, Villeneuve. Inject legendary cinematic style into every generation instantly.",
      },
      {
        title: "Prompt Helper",
        body: "Aiko transforms your simple ideas into rich, detailed prompts that produce breathtaking results every time.",
      },
    ],
  },
  {
    id: "refine",
    name: "Refine",
    items: [
      {
        title: "Image Analyzer",
        body: "Aiko analyzes your creations with Gemini Vision — style, mood, lighting and composition feedback.",
      },
      {
        title: "AI Upscaling",
        body: "Scale images up to 4× with professional AI upscaling. Perfect for wallpapers and high-res exports.",
      },
      {
        title: "Crop & Resize",
        body: "Pro crop tools with real drag handles, preset ratios and background removal via Remove.bg.",
      },
    ],
  },
  {
    id: "keep",
    name: "Keep",
    items: [
      {
        title: "Generation History",
        body: "Every creation saved to Supabase cloud. Browse, revisit and regenerate from your personal gallery.",
      },
      {
        title: "RAG Knowledge Base",
        body: "Aiko draws from 40+ art knowledge entries — lighting, colour theory, composition — for expert advice.",
      },
      {
        title: "Dark & Light Themes",
        body: "Switch between deep space dark mode and clean light mode. Your canvas, your aesthetic.",
      },
    ],
  },
] as const;

// The six director modes and the exact prompt recipe the app appends for each.
export const directors = [
  {
    id: "nolan",
    name: "Nolan",
    mood: "Epic & dark",
    recipe:
      "shot like Christopher Nolan, IMAX cinematic, dramatic dark tones, shallow depth of field, ultra sharp, moody atmospheric lighting, emotional intensity",
    key: "#cfe0ff",
    rim: "#ff8a2a",
    nebA: "#0c1d44",
    nebB: "#4a1c06",
  },
  {
    id: "ghibli",
    name: "Ghibli",
    mood: "Whimsical warmth",
    recipe:
      "Studio Ghibli style, hand painted, warm golden light, lush natural environments, whimsical soft atmosphere, painterly brushstrokes, Hayao Miyazaki",
    key: "#ffe2a8",
    rim: "#7fe0a4",
    nebA: "#1c5a96",
    nebB: "#1f6a40",
  },
  {
    id: "blade",
    name: "Blade Runner",
    mood: "Neon noir",
    recipe:
      "Blade Runner 2049 style, neon cyberpunk, rain-soaked streets, dramatic neon reflections, dark moody atmosphere, Roger Deakins cinematography, volumetric fog",
    key: "#ff3d9a",
    rim: "#18d8ff",
    nebA: "#5a0a4a",
    nebB: "#06304a",
  },
  {
    id: "kubrick",
    name: "Kubrick",
    mood: "Cold symmetry",
    recipe:
      "Stanley Kubrick style, perfect one-point perspective symmetry, cold clinical lighting, eerie stillness, wide angle lens, methodical composition",
    key: "#f4f8ff",
    rim: "#ff2a2a",
    nebA: "#14171d",
    nebB: "#3a0606",
  },
  {
    id: "wong",
    name: "Wong Kar-wai",
    mood: "Dreamy & hazy",
    recipe:
      "Wong Kar-wai style, slow motion haze, warm nostalgic tones, motion blur, neon signs, intimate close-ups, melancholic romantic mood, film grain",
    key: "#ffb347",
    rim: "#2bd17e",
    nebA: "#6a1420",
    nebB: "#0d3a2a",
  },
  {
    id: "villeneuve",
    name: "Villeneuve",
    mood: "Vast & epic",
    recipe:
      "Denis Villeneuve style, Dune cinematography, vast landscapes, otherworldly scale, golden desert light, minimal dialogue tension, Greig Fraser photography",
    key: "#ffc27a",
    rim: "#e0763a",
    nebA: "#6b3a12",
    nebB: "#2a1608",
  },
] as const;

export const directorIntro = {
  title: "Director Mode",
  body: "Channel Nolan, Kubrick, Ghibli, Villeneuve. Inject legendary cinematic style into every generation instantly.",
  recipeLabel: "Added to your prompt",
};

export const aiko = {
  title: ["Aiko —", "Your Creative Soul"],
  body: "Aiko is your always-on AI creative assistant. She chats, improves prompts, analyzes images, and brings expert art knowledge to every session.",
  powers: [
    { title: "Groq Llama 3.3", body: "Lightning-fast sub-second responses" },
    { title: "Gemini Vision", body: "Deep image understanding & feedback" },
    { title: "Firebase Personality", body: "Aiko's unique character, always consistent" },
    { title: "40+ Art Knowledge Entries", body: "Expert lighting, colour theory & composition" },
  ],
  // Entries from Aiko's knowledge base, verbatim.
  askLabel: "Ask Aiko about",
  knowledge: [
    {
      topic: "Golden hour",
      answer:
        "Golden hour occurs just after sunrise or before sunset. Features warm orange and golden tones, long soft shadows, glowing atmosphere. Prompt terms: golden hour, magic hour, warm light, sunset glow, backlit.",
    },
    {
      topic: "Rim lighting",
      answer:
        "Rim lighting places a light source behind the subject creating an edge glow. Creates dramatic silhouette effect. Prompt terms: rim lighting, backlight, edge light, cinematic lighting, dramatic.",
    },
    {
      topic: "Bokeh",
      answer:
        "Bokeh is the aesthetic blur of out-of-focus areas. Created by wide aperture lenses. Prompt terms: bokeh, f/1.4, f/1.8, shallow depth of field, blurred background, 85mm lens, portrait lens.",
    },
    {
      topic: "Chiaroscuro",
      answer:
        "Chiaroscuro uses strong contrast between light and dark. Mastered by Rembrandt and Caravaggio. Prompt terms: chiaroscuro, dramatic shadows, high contrast, Rembrandt lighting, dark background.",
    },
    {
      topic: "Symmetry",
      answer:
        "Perfect symmetry creates order and grandeur. Used by Kubrick in film. Prompt terms: perfect symmetry, centered composition, mirror image, architectural symmetry, balanced.",
    },
  ],
};

export const stack = {
  title: "Built with",
  items: ["Cloudflare AI", "Groq", "Gemini Vision", "Firebase", "Supabase", "Flutter"],
};

export const launch = {
  title: "Ready to Create?",
  // Original: "Join thousands of creators building their imagination with Aether."
  // "thousands" is unverified, so it is softened here. Restore it in one place if it is true.
  body: "Join the creators building their imagination with Aether.",
  primary: "Start Creating Free",
};

export const footer = {
  credit: "Built by Yash Pandey",
  stack: "Cloudflare AI, Groq, Gemini, Firebase & Supabase",
  legal: "© 2026 Aether Studio. All rights reserved.",
};

// What Aiko says at each stop. NEW lines restate nearby copy; the three in `aiko` are her original bubbles.
export const lines: Record<string, string[]> = {
  arrival: ["Hi, I'm Aiko. Let me show you around Aether Studio."],
  studio: ["Describe your vision. I'll help bring it to life."],
  numbers: ["Nine styles, six directors, and forty-plus things I know about art."],
  create: ["Give me a simple idea. I'll turn it into a rich, detailed prompt."],
  refine: ["I'll tell you what's working: style, mood, lighting, composition."],
  keep: ["Every creation is saved. Revisit and regenerate any time."],
  director: ["Pick a director and watch the light change."],
  aiko: [
    "Shall I improve your prompt?",
    'Try "golden hour rim lighting" for dramatic portraits.',
    "Beautiful atmospheric perspective in this piece!",
  ],
  stack: ["This is everything I run on."],
  launch: ["Ready when you are."],
};

export const stops = [
  { id: "arrival", label: "Arrival" },
  { id: "studio", label: "The studio" },
  { id: "numbers", label: "Numbers" },
  { id: "create", label: "Features" },
  { id: "refine", label: null },
  { id: "keep", label: null },
  { id: "director", label: "Director Mode" },
  { id: "aiko", label: "Aiko" },
  { id: "stack", label: "Built with" },
  { id: "launch", label: "Launch" },
] as const;

export type StopId = (typeof stops)[number]["id"];
