"use client";

import { useEffect, useRef, useState } from "react";
import { flight, say } from "@/lib/flight";
import { directors, directorIntro, lines } from "@/lib/content";

/** Director Mode. Scrolling (or picking a name) relights the whole scene, Aiko included. */
export default function Directors() {
  const [pick, setPick] = useState(0);
  const root = useRef<HTMLElement>(null);
  const live = useRef(false);
  const d = directors[pick];

  useEffect(() => {
    const onScroll = () => {
      const el = root.current;
      if (!el || document.documentElement.dataset.flight === "off") return;
      const r = el.getBoundingClientRect();
      const mid = innerHeight * 0.5;
      const inside = r.top < mid && r.bottom > mid;
      live.current = inside;
      if (!inside) {
        flight.director = -1;
        return;
      }
      const p = Math.min(0.999, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      setPick(Math.floor(p * directors.length));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!live.current) return;
    flight.director = pick;
    say(`${directors[pick].name}. ${directors[pick].mood}.`);
  }, [pick]);

  const choose = (i: number) => {
    const el = root.current;
    if (!el || document.documentElement.dataset.flight === "off") {
      setPick(i);
      return;
    }
    const top = el.getBoundingClientRect().top + scrollY;
    const span = el.offsetHeight - innerHeight;
    scrollTo({ top: top + ((i + 0.5) / directors.length) * span, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      className="director"
      id="director"
      data-stop="director"
      style={{ "--key": d.key, "--rim": d.rim } as React.CSSProperties}
    >
      <div className="director__stick">
        <div className="wrap">
          <div className="director__copy">
            <h2>{directorIntro.title}</h2>
            <p>{directorIntro.body}</p>
            <ul className="director__list">
              {directors.map((x, i) => (
                <li key={x.id}>
                  <button type="button" aria-pressed={i === pick} onClick={() => choose(i)}>
                    <strong>{x.name}</strong>
                    <span>{x.mood}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="swatch" />
            <dl className="recipe" aria-live="polite">
              <dt>{directorIntro.recipeLabel}</dt>
              <dd>{d.recipe}</dd>
            </dl>
            <p className="aiko-line">
              <b>Aiko:</b> {lines.director[0]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
