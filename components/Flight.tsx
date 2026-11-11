"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { flight, setStop, resetSay } from "@/lib/flight";

const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

type Mode = "pending" | "3d" | "off";

class Guard extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const canWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/** Runs the flight: decides whether 3D can run, drives scroll, and maps scroll to Aiko's route. */
export default function Flight() {
  const [mode, setMode] = useState<Mode>("pending");
  const [lite, setLite] = useState(false);

  useEffect(() => {
    resetSay(); // drop anything Aiko was saying on another page
    const forcedOff = new URLSearchParams(location.search).get("flight") === "off";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ok = !forcedOff && !reduced && canWebGL();
    setLite((navigator.hardwareConcurrency || 8) <= 4 || innerWidth < 760);
    setMode(ok ? "3d" : "off");
    document.documentElement.dataset.flight = ok ? "loading" : "off";
  }, []);

  // scroll position -> continuous stop index
  useEffect(() => {
    if (mode === "pending") return;
    let tops: number[] = [];
    let end = 0;
    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
      tops = els.map((e) => e.getBoundingClientRect().top + scrollY);
      end = document.documentElement.scrollHeight;
    };
    const update = () => {
      const c = scrollY + innerHeight * 0.5;
      let i = 0;
      while (i < tops.length - 1 && c >= tops[i + 1]) i++;
      const next = tops[i + 1] ?? end;
      const u = Math.min(1, Math.max(0, (c - tops[i]) / Math.max(1, next - tops[i])));
      let f = i;
      if (u < 0.25) f = i - 0.5 + 0.5 * (u / 0.25);
      else if (u > 0.75) f = i + 0.5 * ((u - 0.75) / 0.25);
      flight.f = Math.min(tops.length - 1, Math.max(0, f));
      flight.scrollY = scrollY;
      setStop(Math.round(flight.f));
    };
    const onPointer = (e: PointerEvent) => {
      flight.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      flight.pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(document.body);
    addEventListener("scroll", update, { passive: true });
    addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      ro.disconnect();
      removeEventListener("scroll", update);
      removeEventListener("pointermove", onPointer);
    };
  }, [mode]);

  // smooth scroll and the authored motion, only when the flight is on
  useEffect(() => {
    if (mode !== "3d") return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const lenis = new Lenis({ lerp: 0.11, anchors: true });
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", (l: Lenis) => {
      flight.velocity = l.velocity;
      ScrollTrigger.update();
    });

    const ctx = gsap.context(() => {
      // arrival: the one big entrance. Letters rise out of blur while Aiko boots up.
      const split = SplitText.create(".arrival h1 .lead", { type: "chars" });
      gsap.from(split.chars, {
        yPercent: 110,
        opacity: 0,
        filter: "blur(14px)",
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.05,
        delay: 0.2,
      });
      gsap.from(".arrival .cycle", { yPercent: 110, opacity: 0, filter: "blur(14px)", duration: 1.2, ease: "expo.out", delay: 0.5 });
      gsap.from(".arrival__body, .arrival__actions, .arrival__note", {
        y: 18,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.09,
        delay: 0.85,
      });

      // numbers: the sentence lights up word by word as you scroll through it
      gsap.fromTo(
        ".statement .word",
        { opacity: 0.13 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: ".numbers", start: "top 35%", end: "bottom 95%", scrub: true },
        },
      );

      // studio: the app window tilts up into place, tied to scroll
      gsap.from(".app", {
        y: 70,
        rotateX: 14,
        opacity: 0,
        transformPerspective: 1400,
        transformOrigin: "50% 100%",
        ease: "none",
        scrollTrigger: { trigger: ".app", start: "top 96%", end: "top 52%", scrub: 0.6 },
      });

      // launch: the headline closes in as you fall toward the black hole
      gsap.from(".launch h2", {
        letterSpacing: "0.08em",
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: ".launch", start: "top 80%", end: "top 20%", scrub: 0.6 },
      });
      gsap.from(".site-footer__mark", {
        yPercent: 35,
        ease: "none",
        scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: true },
      });
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [mode]);

  const fail = () => {
    document.documentElement.dataset.flight = "off";
    setMode("off");
  };

  return (
    <div className="stage" aria-hidden>
      {mode === "3d" && (
        <Guard onFail={fail}>
          <Scene lite={lite} onReady={() => (document.documentElement.dataset.flight = "on")} />
        </Guard>
      )}
    </div>
  );
}
