import Flight from "@/components/Flight";
import AikoSays from "@/components/AikoSays";
import Rail from "@/components/Rail";
import HeroWords from "@/components/HeroWords";
import StudioMock from "@/components/StudioMock";
import Chapters from "@/components/Chapters";
import Directors from "@/components/Directors";
import AskAiko from "@/components/AskAiko";
import IrisLink from "@/components/IrisLink";
import { hero, studio, numbers, aiko, stack, launch, footer, lines } from "@/lib/content";

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14m-6-6l6 6-6 6" />
  </svg>
);

const Line = ({ id }: { id: string }) => (
  <p className="aiko-line">
    <b>Aiko:</b> {lines[id][0]}
  </p>
);

const Still = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img className="fallback-aiko" src="/aiko-still.webp" width={880} height={1120} alt="Aiko, a small hovering robot with an indigo helmet and a glowing screen face" loading="lazy" />
);

export default function Page() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Flight />

      <header className="site-header">
        <a className="wordmark" href="#arrival" aria-label="Aether Studio, back to top">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="5" fill="#9a7bff" />
            <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="#ffb454" strokeWidth="1.4" transform="rotate(-24 12 12)" />
          </svg>
          AETHER
        </a>
        <nav className="site-nav" aria-label="Main">
          <a className="nav-link" href="#features">
            Features
          </a>
          <a className="nav-link" href="#aiko">
            Aiko AI
          </a>
          <IrisLink className="nav-link nav-link--keep" href="/login/">
            Sign In
          </IrisLink>
          <IrisLink className="btn btn--small" href="/signup/">
            Get Started <Arrow />
          </IrisLink>
        </nav>
      </header>

      <Rail />
      <AikoSays />

      <main id="main">
        <section className="arrival wrap" id="arrival" data-stop="arrival" style={{ position: "relative" }}>
          <div className="arrival__copy">
            <h1>
              <span className="line">
                <span className="lead">{hero.lead}</span>
              </span>
              <span className="line">
                <HeroWords />
              </span>
            </h1>
            <p className="arrival__body">{hero.body}</p>
            <div className="arrival__actions">
              <IrisLink className="btn" href="/signup/">
                {hero.primary} <Arrow />
              </IrisLink>
              <a className="btn btn--ghost" href="#features">
                {hero.secondary}
              </a>
            </div>
            <p className="arrival__note">{hero.note}</p>
            <Line id="arrival" />
          </div>
          <Still />
          <span className="scroll-cue" aria-hidden>
            Scroll to fly
          </span>
        </section>

        <section className="studio" id="studio" data-stop="studio">
          <div className="wrap">
            <div className="studio__head">
              <h2>{studio.title}</h2>
              <div>
                <p>{studio.body}</p>
                <Line id="studio" />
              </div>
            </div>
            <StudioMock />
          </div>
        </section>

        <section className="numbers" id="numbers" data-stop="numbers" aria-labelledby="numbers-title">
          <div className="numbers__stick">
            <div className="wrap">
              <h2 className="sr-only" id="numbers-title">
                Aether Studio in numbers
              </h2>
              <p className="statement">
                {numbers.map((n) => (
                  <span key={n.label}>
                    <b className="word">{n.value}</b>{" "}
                    {n.label.split(" ").map((w, i, a) => (
                      <span key={w}>
                        <span className="word">
                          {w}
                          {i === a.length - 1 ? "." : ""}
                        </span>{" "}
                      </span>
                    ))}
                  </span>
                ))}
              </p>
              <Line id="numbers" />
            </div>
          </div>
        </section>

        <Chapters />

        <Directors />

        <section className="aiko-sec" id="aiko" data-stop="aiko">
          <div className="wrap">
            <div className="aiko-sec__copy">
              <Still />
              <h2>
                <span>{aiko.title[0]}</span>
                <span>{aiko.title[1]}</span>
              </h2>
              <p>{aiko.body}</p>
              <dl className="powers">
                {aiko.powers.map((p) => (
                  <div key={p.title}>
                    <dt>{p.title}</dt>
                    <dd>{p.body}</dd>
                  </div>
                ))}
              </dl>
              <AskAiko />
            </div>
          </div>
        </section>

        <section className="stack" id="stack" data-stop="stack">
          <div className="wrap">
            <h2>{stack.title}</h2>
            <ul className="orbit">
              {stack.items.map((s, i) => (
                <li key={s} style={{ "--i": i } as React.CSSProperties}>
                  {s}
                </li>
              ))}
            </ul>
            <Line id="stack" />
          </div>
        </section>

        <section className="launch" id="launch" data-stop="launch">
          <div className="wrap">
            <div className="launch__copy">
              <h2>{launch.title}</h2>
              <p>{launch.body}</p>
              <IrisLink className="btn" href="/signup/">
                {launch.primary} <Arrow />
              </IrisLink>
              <Line id="launch" />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span className="site-footer__mark" aria-hidden>
          AETHER
        </span>
        <div className="wrap site-footer__row">
          <span>
            {footer.credit} · {footer.stack}
          </span>
          <span>{footer.legal}</span>
        </div>
      </footer>
    </>
  );
}
