"use client";

import { useState } from "react";
import { say } from "@/lib/flight";
import { aiko } from "@/lib/content";

/** A small taste of Aiko's knowledge base: real entries from the app. */
export default function AskAiko() {
  const [pick, setPick] = useState(-1);
  return (
    <div className="ask">
      <p>{aiko.askLabel}</p>
      <div className="chips">
        {aiko.knowledge.map((k, i) => (
          <button
            key={k.topic}
            type="button"
            className="chip"
            aria-pressed={i === pick}
            onClick={() => {
              setPick(i);
              say(`Here's what I know about ${k.topic.toLowerCase()}.`);
            }}
          >
            {k.topic}
          </button>
        ))}
      </div>
      <p className="ask__answer" aria-live="polite" data-empty={pick < 0}>
        {pick < 0 ? "Pick a topic and Aiko answers from her knowledge base." : aiko.knowledge[pick].answer}
      </p>
    </div>
  );
}
