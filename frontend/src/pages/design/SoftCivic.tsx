import { Link } from 'react-router'

const STEPS = [
  { title: 'Describe your challenge', body: "Plain language, however you'd say it in person. No forms to decipher.", hue: 'peach' },
  { title: 'The AI drafts a brief', body: 'Objectives, deliverables, suggested skills, and a timeline you can edit.', hue: 'lilac' },
  { title: 'Students arrive, matched', body: 'Each recommendation says exactly why. The reasoning is yours to question.', hue: 'mint' },
  { title: 'The team builds it with you', body: 'You choose who joins. The project begins. People meet, work happens.', hue: 'sand' },
]

const STATS = [
  { v: '42', l: 'local nonprofits onboarded' },
  { v: '180+', l: 'students across OC campuses' },
  { v: '6 wks', l: 'median time from brief to delivery' },
]

export default function SoftCivic() {
  return (
    <div className="sc-root">
      <style>{softCivicCss}</style>

      <div className="sc-blob sc-blob-a" aria-hidden />
      <div className="sc-blob sc-blob-b" aria-hidden />
      <div className="sc-blob sc-blob-c" aria-hidden />

      <section className="sc-hero">
        <span className="sc-chip">A quieter kind of civic tech</span>
        <h1>
          Local <span className="sc-ital">challenges</span>, meet local <span className="sc-ital">talent</span>.
        </h1>
        <p className="sc-lede">
          Nonprofits in Orange County post what they need. Students bring skills they want to use for real.
          Talent Bridge introduces them and keeps the collaboration gentle, legible, and human.
        </p>
        <div className="sc-cta-row">
          <Link to="/register?role=organization" className="sc-btn sc-btn-primary">I'm a nonprofit</Link>
          <Link to="/register?role=student" className="sc-btn sc-btn-ghost">I'm a student →</Link>
        </div>

        <div className="sc-stats">
          {STATS.map((s) => (
            <div key={s.l} className="sc-stat">
              <div className="sc-stat-v">{s.v}</div>
              <div className="sc-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sc-steps">
        <div className="sc-steps-head">
          <span className="sc-eyebrow">The flow</span>
          <h2>Four steps, nothing hidden.</h2>
        </div>
        <div className="sc-steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.title} className={`sc-card sc-card-${s.hue}`}>
              <div className="sc-card-num">{String(i + 1).padStart(2, '0')}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <svg className="sc-card-arc" viewBox="0 0 120 40" aria-hidden>
                <path d="M4 20 Q 60 -10 116 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>
      </section>

      <section className="sc-quote">
        <blockquote>
          "We described the problem in two paragraphs. Four weeks later, a working app and three new friends.
          I didn't have to translate anything."
        </blockquote>
        <cite>Director · Habitat for Humanity OC</cite>
      </section>

      <section className="sc-closing">
        <div className="sc-closing-inner">
          <h2>Post a challenge. See who shows up.</h2>
          <p>Takes about ten minutes. Costs nothing. We built this for communities, not customers.</p>
          <Link to="/register?role=organization" className="sc-btn sc-btn-primary sc-btn-lg">Post your challenge</Link>
        </div>
      </section>
    </div>
  )
}

const softCivicCss = `
.sc-root {
  --bg: #fbf7f2;
  --ink: #1f1a2b;
  --muted: #6a6479;
  --peach: #fde0cc;
  --peach-ink: #a2502b;
  --lilac: #e4ddff;
  --lilac-ink: #4b3b96;
  --mint: #d4ecd8;
  --mint-ink: #27613a;
  --sand: #f3e7c6;
  --sand-ink: #7a5e1f;
  --primary: #4b3b96;
  --primary-ink: #fbf7f2;
  position: relative; overflow: hidden;
  background: var(--bg); color: var(--ink);
  font-family: "Figtree", system-ui, sans-serif;
  min-height: 100%;
}

.sc-blob {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.55;
  pointer-events: none; z-index: 0;
}
.sc-blob-a { width: 480px; height: 480px; background: var(--peach); top: -120px; left: -80px; }
.sc-blob-b { width: 440px; height: 440px; background: var(--lilac); top: 180px; right: -120px; opacity: 0.5; }
.sc-blob-c { width: 420px; height: 420px; background: var(--mint); bottom: -140px; left: 30%; opacity: 0.45; }

.sc-hero {
  position: relative; z-index: 1;
  max-width: 1100px; margin: 0 auto;
  padding: 96px 24px 48px;
}
.sc-chip {
  display: inline-block; padding: 6px 14px; border-radius: 999px;
  background: #ffffffcc; backdrop-filter: blur(6px);
  border: 1px solid rgba(31,26,43,0.08);
  font-size: 13px; font-weight: 500; color: var(--muted); letter-spacing: 0.02em;
}
.sc-hero h1 {
  font-family: "Fraunces", serif; font-weight: 500; font-size: clamp(44px, 7vw, 88px);
  line-height: 1.02; letter-spacing: -0.028em; margin: 20px 0 20px;
  max-width: 18ch; text-wrap: balance;
}
.sc-ital { font-style: italic; font-weight: 400; color: var(--primary); }
.sc-lede {
  font-size: 20px; line-height: 1.55; max-width: 56ch; color: var(--muted);
}
.sc-cta-row { margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.sc-btn {
  display: inline-block; padding: 14px 24px; text-decoration: none;
  font-weight: 600; font-size: 15px; border-radius: 999px;
  border: 1px solid transparent;
}
.sc-btn-primary { background: var(--primary); color: var(--primary-ink); }
.sc-btn-primary:hover { background: #352872; }
.sc-btn-ghost {
  background: transparent; color: var(--ink);
  border-color: rgba(31,26,43,0.15);
}
.sc-btn-ghost:hover { background: #ffffffaa; }
.sc-btn-lg { padding: 16px 30px; font-size: 16px; }

.sc-stats {
  margin-top: 56px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px; background: #ffffffaa; backdrop-filter: blur(10px);
  border: 1px solid rgba(31,26,43,0.08); border-radius: 24px; padding: 20px;
}
.sc-stat { padding: 10px 14px; }
.sc-stat-v {
  font-family: "Fraunces", serif; font-weight: 500; font-size: 36px; line-height: 1;
  letter-spacing: -0.02em;
}
.sc-stat-l {
  margin-top: 6px; font-size: 13px; color: var(--muted); line-height: 1.3;
}

.sc-steps {
  position: relative; z-index: 1; max-width: 1100px; margin: 0 auto;
  padding: 72px 24px;
}
.sc-steps-head { margin-bottom: 36px; max-width: 760px; }
.sc-eyebrow {
  font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--primary); font-weight: 600;
}
.sc-steps h2 {
  font-family: "Fraunces", serif; font-weight: 500; font-size: clamp(28px, 4vw, 44px);
  margin: 8px 0 0; letter-spacing: -0.02em; text-wrap: balance;
}
.sc-steps-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;
}
.sc-card {
  position: relative; background: #ffffff; border-radius: 28px;
  padding: 28px 24px 72px; min-height: 220px;
  border: 1px solid rgba(31,26,43,0.06);
}
.sc-card-peach { background: linear-gradient(160deg, #fff 60%, var(--peach)); color: var(--peach-ink); }
.sc-card-lilac { background: linear-gradient(160deg, #fff 60%, var(--lilac)); color: var(--lilac-ink); }
.sc-card-mint  { background: linear-gradient(160deg, #fff 60%, var(--mint));  color: var(--mint-ink); }
.sc-card-sand  { background: linear-gradient(160deg, #fff 60%, var(--sand));  color: var(--sand-ink); }
.sc-card-num {
  font-family: "Fraunces", serif; font-weight: 500; font-size: 32px; line-height: 1;
  letter-spacing: -0.02em; opacity: 0.9;
}
.sc-card h3 {
  font-family: "Fraunces", serif; font-weight: 500; font-size: 22px; line-height: 1.2;
  margin: 14px 0 10px; color: var(--ink);
}
.sc-card p {
  margin: 0; font-size: 15px; line-height: 1.5; color: var(--muted);
}
.sc-card-arc {
  position: absolute; bottom: 20px; right: 20px; width: 70px; height: auto; opacity: 0.5;
}

.sc-quote {
  position: relative; z-index: 1; max-width: 820px; margin: 0 auto;
  padding: 56px 24px; text-align: center;
}
.sc-quote blockquote {
  font-family: "Fraunces", serif; font-weight: 400; font-style: italic;
  font-size: clamp(22px, 3vw, 32px); line-height: 1.35; margin: 0; letter-spacing: -0.01em;
  text-wrap: balance;
}
.sc-quote cite {
  display: block; margin-top: 20px; font-style: normal; font-size: 13px;
  color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase;
}

.sc-closing {
  position: relative; z-index: 1; max-width: 1100px; margin: 0 auto;
  padding: 24px 24px 96px;
}
.sc-closing-inner {
  background: var(--ink); color: var(--primary-ink); padding: 56px 40px;
  border-radius: 32px; text-align: center;
}
.sc-closing h2 {
  font-family: "Fraunces", serif; font-weight: 500; font-size: clamp(28px, 4vw, 48px);
  margin: 0 0 14px; letter-spacing: -0.02em; text-wrap: balance;
}
.sc-closing p {
  margin: 0 auto 28px; max-width: 48ch; font-size: 17px; color: #c8c3d6;
}
.sc-closing .sc-btn-primary { background: var(--peach); color: var(--peach-ink); }
.sc-closing .sc-btn-primary:hover { background: #ffd0b2; }

@media (prefers-color-scheme: dark) {
  .sc-root:not([data-theme="light"]) {
    --bg: #15131d;
    --ink: #f0eafa;
    --muted: #9d96ad;
    color-scheme: dark;
  }
  .sc-root:not([data-theme="light"]) .sc-chip { background: #ffffff14; border-color: #ffffff22; color: var(--muted); }
  .sc-root:not([data-theme="light"]) .sc-stats { background: #ffffff0a; border-color: #ffffff14; }
  .sc-root:not([data-theme="light"]) .sc-card { background: #1f1b2a; border-color: #ffffff10; }
  .sc-root:not([data-theme="light"]) .sc-card-peach { background: linear-gradient(160deg, #1f1b2a 60%, #4a2918); color: #ffd0b2; }
  .sc-root:not([data-theme="light"]) .sc-card-lilac { background: linear-gradient(160deg, #1f1b2a 60%, #2a2160); color: #c8bfff; }
  .sc-root:not([data-theme="light"]) .sc-card-mint  { background: linear-gradient(160deg, #1f1b2a 60%, #1d4a2c); color: #a9d5b4; }
  .sc-root:not([data-theme="light"]) .sc-card-sand  { background: linear-gradient(160deg, #1f1b2a 60%, #4c3b0d); color: #e6cf7f; }
  .sc-root:not([data-theme="light"]) .sc-closing-inner { background: #0e0c15; }
}
`
