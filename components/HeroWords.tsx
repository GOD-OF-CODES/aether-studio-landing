"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { hero } from "@/lib/content";

/** "Create ___." The last word cycles, as it does in the app. */
export default function HeroWords() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      gsap.to(".cycle span", {
        yPercent: -60,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          setI((n) => (n + 1) % hero.words.length);
          gsap.fromTo(
            ".cycle span",
            { yPercent: 60, opacity: 0, filter: "blur(10px)" },
            { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" },
          );
        },
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <span className="cycle" aria-hidden>
        <span>{hero.words[i]}</span>
      </span>
      <span className="sr-only">{hero.words[0]}</span>
    </>
  );
}
