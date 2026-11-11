"use client";

import { useEffect, useRef, useState } from "react";
import { studio } from "@/lib/content";

const GRADES = [
  { id: "nolan", name: "Nolan" },
  { id: "ghibli", name: "Ghibli" },
  { id: "blade", name: "Blade" },
  { id: "kubrick", name: "Kubrick" },
];

const ICONS: Record<string, React.ReactNode> = {
  Generator: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />,
  History: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  "Crop & Resize": <path d="M7 3v14h14M3 7h14v14" />,
  Upscale: <path d="M12 20V5m-6 6l6-6 6 6" />,
};

type State = "idle" | "typing" | "busy" | "done";

const PETALS = Array.from({ length: 16 }, (_, i) => ({
  x: 40 + ((i * 97) % 600),
  y: (i * 53) % 120,
  d: (i * 0.47) % 7,
  r: 3 + (i % 3),
}));

/** The generator, working: the prompt types itself, the picture develops, and the chips really regrade it. */
export default function StudioMock() {
  const [state, setState] = useState<State>("idle");
  const [typed, setTyped] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [grade, setGrade] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const generate = () => {
    timers.current.forEach(clearTimeout);
    setState("busy");
    timers.current = [setTimeout(() => setState("done"), 1700)];
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (reduced) {
          setTyped(studio.prompt);
          setState("done");
          return;
        }
        setState("typing");
        let i = 0;
        const step = () => {
          i += 1;
          setTyped(studio.prompt.slice(0, i));
          if (i < studio.prompt.length) timers.current.push(setTimeout(step, 34));
          else timers.current.push(setTimeout(generate, 450));
        };
        step();
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <div className="app" ref={root}>
        <div className="app__bar">
          <i />
          <i />
          <i />
          <span>aether_studio</span>
        </div>
        <div className="app__body">
          <div className="app__side">
            {studio.nav.map((n, i) => (
              <div key={n} className="app__nav" data-on={i === 0}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {ICONS[n]}
                </svg>
                {n}
              </div>
            ))}
            <p className="app__label" id="grade-label">
              Director mode
            </p>
            <div className="chips" role="group" aria-labelledby="grade-label">
              {GRADES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="chip"
                  aria-pressed={grade === g.id}
                  onClick={() => setGrade(grade === g.id ? null : g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
          <div className="app__main">
            <p className="app__prompt">
              <span className="sr-only">Prompt: {studio.prompt}</span>
              <span aria-hidden>
                {state === "idle" ? studio.prompt : typed}
                {state === "typing" && <span className="caret" />}
              </span>
            </p>
            <div className="app__row">
              <span className="app__style">Cinematic</span>
              <div className="chips" role="group" aria-label="Aspect ratio" style={{ padding: 0 }}>
                {studio.ratios.map((r) => (
                  <button key={r} type="button" className="chip" aria-pressed={ratio === r} onClick={() => setRatio(r)}>
                    {r}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn--small" onClick={generate} disabled={state === "busy"}>
                Generate
              </button>
            </div>
            <div className="app__canvas" data-state={state === "done" ? "done" : state === "busy" ? "busy" : "idle"}>
              <span className="app__status" role="status">
                {state === "busy" ? studio.busy : state === "done" ? "" : studio.empty}
              </span>
              <div
                className="picture"
                data-grade={grade ?? undefined}
                style={{ "--ratio": ratio.replace(":", " / ") } as React.CSSProperties}
              >
                <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A lone samurai at sunset under falling cherry blossoms">
                  <defs>
                    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#24143f" />
                      <stop offset="0.45" stopColor="#8f2f63" />
                      <stop offset="0.78" stopColor="#f0703f" />
                      <stop offset="1" stopColor="#ffc56b" />
                    </linearGradient>
                    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0" stopColor="#fff6d6" />
                      <stop offset="0.55" stopColor="#ffd27a" />
                      <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ffb86b" stopOpacity="0" />
                      <stop offset="1" stopColor="#ffb86b" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  <rect width="640" height="360" fill="url(#sky)" />
                  <circle cx="420" cy="232" r="150" fill="url(#sun)" opacity="0.7" />
                  <circle cx="420" cy="232" r="62" fill="#fff0c2" />
                  <path d="M0 250 L70 205 L130 236 L205 180 L270 228 L340 198 L410 240 L480 210 L560 244 L640 214 V360 H0Z" fill="#5b2553" />
                  <path d="M0 282 L90 250 L170 274 L260 246 L330 270 L430 256 L520 280 L640 258 V360 H0Z" fill="#35153d" />
                  <rect y="210" width="640" height="80" fill="url(#haze)" />
                  {/* the hill and the samurai */}
                  <path d="M0 322 C120 286 250 280 330 296 C440 318 540 308 640 322 V360 H0Z" fill="#0d0714" />
                  <g fill="#0d0714">
                    <path d="M214 214 L262 214 L238 200Z" />
                    <ellipse cx="238" cy="221" rx="8" ry="8.5" />
                    <path d="M226 230 C232 227 244 227 250 230 L258 262 L262 300 L214 300 L218 262Z" />
                    <path d="M250 236 L270 256 L266 261 L246 246Z" />
                    <path d="M222 268 L296 240 L297.5 243 L224 272Z" />
                    <path d="M214 258 L200 288 L206 290 L220 264Z" />
                  </g>
                  {/* cherry branch */}
                  <g stroke="#150a1c" strokeLinecap="round" fill="none">
                    <path d="M-10 30 C80 44 150 30 230 70 C270 90 300 86 340 78" strokeWidth="7" />
                    <path d="M120 38 C150 70 170 84 196 120" strokeWidth="4" />
                    <path d="M230 70 C250 50 270 40 300 34" strokeWidth="3.5" />
                  </g>
                  <g fill="#ffb3cf">
                    {[[60, 36, 13], [96, 30, 10], [150, 48, 14], [190, 112, 12], [176, 90, 9], [236, 62, 13], [282, 40, 11], [300, 82, 12], [338, 76, 10], [120, 60, 9]].map(
                      ([x, y, r], i) => (
                        <circle key={i} cx={x} cy={y} r={r} opacity={0.9 - (i % 3) * 0.15} />
                      ),
                    )}
                  </g>
                  <g fill="#ffd3e2">
                    {[[70, 30, 6], [156, 42, 7], [240, 56, 6], [296, 78, 6], [186, 104, 5]].map(([x, y, r], i) => (
                      <circle key={i} cx={x} cy={y} r={r} />
                    ))}
                  </g>
                  <g fill="#ffc4d9">
                    {PETALS.map((p, i) => (
                      <ellipse key={i} className="petal" cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.55} style={{ "--d": p.d } as React.CSSProperties} />
                    ))}
                  </g>
                </svg>
              </div>
              <span className="app__bar-busy" />
            </div>
          </div>
        </div>
      </div>
      <p className="app__caption">{studio.caption}</p>
    </>
  );
}
