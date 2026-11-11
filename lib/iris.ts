// The iris: a two-layer circular wipe that grows from wherever you clicked, covers the screen
// while the route changes, then opens again on the new page. Runs on the compositor (WAAPI).

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

const layer = (kind: string) => {
  const el = document.createElement("div");
  el.className = `iris iris--${kind}`;
  el.dataset.iris = "";
  document.body.appendChild(el);
  return el;
};

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Close the iris from (x, y), then call go(). */
export function irisClose(x: number, y: number, go: () => void) {
  if (reducedMotion() || !("animate" in document.body)) return go();
  document.querySelectorAll("[data-iris]").forEach((n) => n.remove());
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;
  const frames = [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }];
  layer("glow").animate(frames, { duration: 520, easing: EASE, fill: "forwards" });
  const done = layer("void").animate(frames, { duration: 520, delay: 90, easing: EASE, fill: "both" });
  done.finished.then(go, go);
}

/** Open the iris on arrival. Safe to call when none is closed. */
export function irisOpen() {
  const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-iris]"));
  if (!layers.length) return;
  scrollTo(0, 0); // a real page change always starts at the top; switching sign-in mode does not come through here
  const x = innerWidth / 2;
  const y = innerHeight / 2;
  const r = Math.hypot(x, y) + 40;
  layers.forEach((el, i) => {
    el.getAnimations().forEach((a) => a.cancel());
    el.style.clipPath = "none";
    // an evenodd path would be needed for a true hole; shrinking toward the centre reads the same and stays cheap
    const a = el.animate(
      [{ clipPath: `circle(${r}px at ${x}px ${y}px)`, opacity: 1 }, { clipPath: `circle(${r}px at ${x}px ${y}px)`, opacity: 0 }],
      { duration: i === 0 ? 200 : 520, delay: 120, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
    );
    a.finished.then(() => el.remove(), () => el.remove());
  });
}
