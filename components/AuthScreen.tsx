"use client";

import { Component, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { flight, P, say, type Pose } from "@/lib/flight";
import { signIn, signUp, AFTER_AUTH, authConnected } from "@/lib/auth";
import { irisClose } from "@/lib/iris";
import IrisLink from "./IrisLink";
import AikoSays from "./AikoSays";

const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

type Mode = "login" | "signup";
type Errors = Partial<Record<"name" | "email" | "password", string>>;

const COPY = {
  login: {
    title: "Welcome back",
    body: "Sign in and pick up where you left off.",
    submit: "Sign In",
    alt: "Don't have an account? ",
    altAction: "Sign Up",
    says: "Welcome back. Your gallery is right where you left it.",
  },
  signup: {
    title: "Create your account",
    body: "Free to use. Aiko is with you from the first prompt.",
    submit: "Sign Up",
    alt: "Already have an account? ",
    altAction: "Sign In",
    says: "New here? I'll help with your very first prompt.",
  },
} as const;

const POSES: Record<Mode, { wide: Pose; narrow: Pose }> = {
  login: { wide: P(-0.42, -0.04, 1.14, 0.38, "wave", "happy"), narrow: P(0.12, 0.62, 0.4, 0.1, "wave", "happy") },
  signup: { wide: P(-0.36, -0.04, 1.14, 0.3, "present", "wow"), narrow: P(0.12, 0.62, 0.4, 0.1, "present", "wow") },
};

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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sign in and sign up are one screen in two states, so switching is a transition, not a page load. */
export default function AuthScreen({ initial }: { initial: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [three, setThree] = useState<"pending" | "on" | "off">("pending");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [peek, setPeek] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const first = useRef(true);
  const c = COPY[mode];

  // can the 3D stage run here?
  useEffect(() => {
    const off =
      new URLSearchParams(location.search).get("flight") === "off" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !document.createElement("canvas").getContext("webgl2");
    setThree(off ? "off" : "on");
    document.documentElement.dataset.flight = off ? "off" : "loading";
    flight.f = 0;
    flight.director = -1;
    flight.velocity = 0;
    flight.scrollY = 0;
    const onPointer = (e: PointerEvent) => {
      flight.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      flight.pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      removeEventListener("pointermove", onPointer);
      flight.override = null;
      flight.shy = false;
    };
  }, []);

  // Aiko takes her place for this mode and greets you
  useEffect(() => {
    const place = () => (flight.override = innerWidth < 900 ? POSES[mode].narrow : POSES[mode].wide);
    place();
    addEventListener("resize", place);
    const t = setTimeout(() => say(COPY[mode].says), first.current ? 900 : 150);
    first.current = false;
    return () => {
      removeEventListener("resize", place);
      clearTimeout(t);
    };
  }, [mode]);

  // the back button moves between the two states too
  useEffect(() => {
    const onPop = () => setMode(location.pathname.includes("signup") ? "signup" : "login");
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  const swap = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    setNotice(null);
    history.pushState(null, "", next === "signup" ? "/signup/" : "/login/");
  };

  // she watches what you type: her gaze follows the caret along the field
  const watch = (e: { currentTarget: HTMLInputElement }) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const along = Math.min(1, el.value.length / 28);
    flight.pointer.x = ((r.left + 16 + along * (r.width - 32)) / innerWidth) * 2 - 1;
    flight.pointer.y = -(((r.top + r.height / 2) / innerHeight) * 2 - 1);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const next: Errors = {};
    if (mode === "signup" && !name) next.name = "Tell us what to call you.";
    if (!EMAIL.test(email)) next.email = "Enter a valid email address, like you@example.com.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    setNotice(null);
    const bad = Object.keys(next)[0];
    if (bad) {
      form.current?.querySelector<HTMLInputElement>(`[name="${bad}"]`)?.focus();
      say("Almost. One thing needs fixing.");
      return;
    }
    setBusy(true);
    const result = mode === "signup" ? await signUp(name, email, password) : await signIn(email, password);
    setBusy(false);
    if (result.status === "error") {
      setNotice({ kind: "error", text: result.message });
      say("That didn't work. Have another look.");
    } else if (result.status === "confirm-email") {
      setNotice({ kind: "ok", text: `Check ${email} for a confirmation link, then sign in.` });
      say("Check your inbox. I'll wait.");
    } else {
      say(result.status === "signed-in" ? "You're in. Let's create." : "Taking you to the studio.");
      setTimeout(() => irisClose(innerWidth / 2, innerHeight / 2, () => location.assign(AFTER_AUTH)), 700);
    }
  };

  const field = (name: "name" | "email" | "password", n: number) => ({
    id: `auth-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `auth-${name}-error` : undefined,
    onInput: watch,
    onFocus: watch,
    style: { "--n": n } as React.CSSProperties,
  });

  return (
    <>
      <div className="stage" aria-hidden>
        {three === "on" && (
          <Guard
            onFail={() => {
              document.documentElement.dataset.flight = "off";
              setThree("off");
            }}
          >
            <Scene lite={false} onReady={() => (document.documentElement.dataset.flight = "on")} />
          </Guard>
        )}
      </div>

      <header className="site-header">
        <IrisLink className="wordmark" href="/" aria-label="Aether Studio, back to the home page">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="5" fill="#9a7bff" />
            <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="#ffb454" strokeWidth="1.4" transform="rotate(-24 12 12)" />
          </svg>
          AETHER
        </IrisLink>
        <nav className="site-nav" aria-label="Main">
          <IrisLink href="/">Back to the tour</IrisLink>
        </nav>
      </header>

      <AikoSays dock="top" />

      <main className="auth" id="main">
        <div className="auth__stage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fallback-aiko" src="/aiko-still.webp" width={880} height={1120} alt="Aiko, the Aether Studio guide robot" />
        </div>

        <div className="auth__panel">
          <div className="auth__titles" style={{ "--n": 0 } as React.CSSProperties}>
            {(["login", "signup"] as const).map((m) => (
              <div key={m} data-on={m === mode} aria-hidden={m !== mode}>
                {m === mode ? <h1>{COPY[m].title}</h1> : <div className="h1">{COPY[m].title}</div>}
                <p>{COPY[m].body}</p>
              </div>
            ))}
          </div>

          <div className="switch" role="tablist" aria-label="Sign in or sign up" data-mode={mode} style={{ "--n": 1 } as React.CSSProperties}>
            <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => swap("login")}>
              Sign In
            </button>
            <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => swap("signup")}>
              Sign Up
            </button>
          </div>

          <form ref={form} onSubmit={submit} noValidate style={{ "--n": 2 } as React.CSSProperties}>
            <div className="field" data-open={mode === "signup"}>
              <div>
                <div className="field__in">
                  <label htmlFor="auth-name">Name</label>
                  <input {...field("name", 0)} type="text" autoComplete="name" placeholder="What should Aiko call you?" tabIndex={mode === "signup" ? 0 : -1} disabled={mode !== "signup"} />
                  {errors.name && (
                    <p className="field__error" id="auth-name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="field">
              <div>
                <div className="field__in">
                  <label htmlFor="auth-email">Email</label>
                  <input {...field("email", 0)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="you@example.com" enterKeyHint="next" />
                  {errors.email && (
                    <p className="field__error" id="auth-email-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="field">
              <div>
                <div className="field__in">
                  <label htmlFor="auth-password">Password</label>
                  <div className="field__box">
                    <input
                      {...field("password", 0)}
                      type={peek ? "text" : "password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                      enterKeyHint="go"
                      style={{ paddingRight: 76 }}
                      onFocus={(e) => {
                        watch(e);
                        flight.shy = !peek;
                        if (!peek) say("I'm not looking.");
                      }}
                      onBlur={() => (flight.shy = false)}
                    />
                    <button
                      type="button"
                      className="field__peek"
                      aria-pressed={peek}
                      aria-label={peek ? "Hide password" : "Show password"}
                      onClick={() => {
                        setPeek(!peek);
                        flight.shy = false;
                      }}
                    >
                      {peek ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="field__error" id="auth-password-error">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button className="btn auth__submit" type="submit" disabled={busy} aria-busy={busy}>
              <span>
                <i data-on={!busy && mode === "login"}>Sign In</i>
                <i data-on={!busy && mode === "signup"}>Sign Up</i>
                <i data-on={busy}>One moment</i>
              </span>
            </button>

            <div aria-live="polite">
              {notice && (
                <p className="auth__notice" data-kind={notice.kind}>
                  {notice.text}
                </p>
              )}
            </div>
          </form>

          <p className="auth__alt" style={{ "--n": 3 } as React.CSSProperties}>
            {c.alt}
            <button type="button" onClick={() => swap(mode === "login" ? "signup" : "login")}>
              {c.altAction}
            </button>
          </p>
          {!authConnected && (
            <p className="auth__alt" style={{ "--n": 4, fontSize: "0.82rem", color: "var(--faint)" } as React.CSSProperties}>
              You&apos;ll finish signing in inside Aether Studio.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
