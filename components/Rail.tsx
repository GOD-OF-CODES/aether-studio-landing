"use client";

import { useSyncExternalStore } from "react";
import { subscribe, getStop } from "@/lib/flight";
import { stops } from "@/lib/content";

/** Where you are on the route. Stops without a label belong to the labelled stop before them. */
export default function Rail() {
  const stop = useSyncExternalStore(subscribe, getStop, () => 0);
  let owner = 0;
  const owners = stops.map((s, i) => (s.label ? (owner = i) : owner));
  return (
    <nav aria-label="Sections">
      <ol className="rail">
        {stops.map((s, i) =>
          s.label ? (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={owners[stop] === i ? "true" : undefined}>
                <span>{s.label}</span>
              </a>
            </li>
          ) : null,
        )}
      </ol>
    </nav>
  );
}
