"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flight, subscribe, getStop, getSayId, ui } from "@/lib/flight";
import { lines, stops } from "@/lib/content";

/** Aiko's speech bubble. It follows her head and types out the line for the current stop. */
export default function AikoSays({ dock }: { dock?: "top" }) {
  const stop = useSyncExternalStore(subscribe, getStop, () => 0);
  const sayId = useSyncExternalStore(subscribe, getSayId, () => 0);
  const [turn, setTurn] = useState(0);
  const [shown, setShown] = useState("");
  const el = useRef<HTMLDivElement>(null);
  const fresh = useRef(true);

  const set = flight.override ? [""] : (lines[stops[stop].id] ?? [""]);
  const target = ui.say ?? set[turn % set.length];

  useEffect(() => setTurn(0), [stop]);

  // type the line out
  useEffect(() => {
    let i = 0;
    let done: ReturnType<typeof setTimeout>;
    let rest: ReturnType<typeof setTimeout>;
    setShown("");
    fresh.current = true;
    flight.talking = 1;
    const id = setInterval(() => {
      i += 1;
      setShown(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(id);
        done = setTimeout(() => (flight.talking = 0), 250);
        // on a phone the bubble sits over the page, so it steps aside once it has been read
        rest = setTimeout(() => (fresh.current = false), 3600);
      }
    }, 24);
    return () => {
      clearInterval(id);
      clearTimeout(done);
      clearTimeout(rest);
      flight.talking = 0;
    };
  }, [target, sayId]);

  // stops with several lines rotate through them
  useEffect(() => {
    if (set.length < 2 || ui.say) return;
    const id = setInterval(() => setTurn((t) => t + 1), 4600);
    return () => clearInterval(id);
  }, [set.length, stop, sayId]);

  // follow her head
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const node = el.current;
      if (node) {
        const h = flight.head;
        const w = node.offsetWidth;
        const ht = node.offsetHeight;
        const gap = h.r * 0.72 + 10;
        // side 0: she is tucked against the edge, so the bubble sits above her instead of beside her
        let x = h.side === 0 ? h.x - w * 0.3 : h.side > 0 ? h.x + gap : h.x - gap - w;
        x = Math.min(innerWidth - w - 12, Math.max(12, x));
        const y = Math.max(ht + 76, h.side === 0 ? h.y - h.r * 1.05 : h.y - h.r * 0.25);
        // written straight to transform: a CSS variable here would restyle the children every frame
        node.style.transform = innerWidth > 760 ? `translate3d(${x.toFixed(1)}px, ${(y - ht).toFixed(1)}px, 0)` : "";
        node.dataset.show = String(h.visible && flight.on && shown.length > 0 && (innerWidth > 760 || fresh.current));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown.length]);

  return (
    <div ref={el} className={dock ? "says says--top" : "says"} aria-hidden>
      <b>Aiko</b>
      {shown}
      {shown.length < target.length && <i />}
    </div>
  );
}
