"use client";

import { useSyncExternalStore } from "react";
import { subscribe, getStop } from "@/lib/flight";
import { chapters, featuresTitle, lines } from "@/lib/content";

const FIRST = 3; // stop index of the first chapter

/** Nine features told as three chapters. One pinned stage; scroll turns the page. */
export default function Chapters() {
  const stop = useSyncExternalStore(subscribe, getStop, () => 0);
  const active = Math.min(chapters.length - 1, Math.max(0, stop - FIRST));
  const state = (i: number) => (i === active ? "on" : i < active ? "past" : "next");

  return (
    <div className="features" id="features">
      <div className="features__stage">
        <div className="wrap features__grid">
          <h2 className="features__lead">{featuresTitle}</h2>
          <div className="features__names" aria-hidden>
            {chapters.map((c, i) => (
              <span key={c.id} data-state={state(i)}>
                {c.name}
              </span>
            ))}
          </div>
          <div className="features__lists">
            {chapters.map((c, i) => (
              <ul key={c.id} className="chapter" data-state={state(i)} aria-label={c.name}>
                <li className="chapter-name" aria-hidden>
                  {c.name}
                </li>
                {c.items.map((it, n) => (
                  <li key={it.title} style={{ "--i": n } as React.CSSProperties}>
                    <h3>{it.title}</h3>
                    <p>{it.body}</p>
                  </li>
                ))}
                <li className="aiko-line" style={{ "--i": 3 } as React.CSSProperties}>
                  <b>Aiko:</b> {lines[c.id][0]}
                </li>
              </ul>
            ))}
          </div>
        </div>
      </div>
      <div className="features__markers" aria-hidden>
        {chapters.map((c) => (
          <div key={c.id} id={c.id} data-stop={c.id} className="features__marker" />
        ))}
      </div>
    </div>
  );
}
