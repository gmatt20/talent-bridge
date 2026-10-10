import { Link } from 'react-router'

const STEPS = [
  { k: 'I', title: 'Describe the challenge', body: 'A plain-language brief from the organization. Jargon not required.' },
  { k: 'II', title: 'The brief, structured', body: 'The AI turns it into objectives, deliverables, skills and a timeline.' },
  { k: 'III', title: 'Students are matched', body: 'Each recommendation ships with the reasons behind it. No black box.' },
  { k: 'IV', title: 'The team gets to work', body: 'You choose who joins. The project begins the week after.' },
]

export default function SundayPaper() {
  return (
    <div className="sp-root">
      <style>{sundayPaperCss}</style>

      <header className="sp-masthead">
        <div className="sp-dateline">
          <span>Vol. I · No. 1</span>
          <span>Orange County, Fall 2026</span>
          <span>One Dollar</span>
        </div>
        <div className="sp-nameplate">The Talent Bridge</div>
        <div className="sp-subhead">A quarterly broadsheet for community challenges and the hands that solve them</div>
      </header>

      <article className="sp-hero">
        <div className="sp-hero-text">
          <p className="sp-kicker">Field report · Civic technology</p>
          <h1>Local challenges, meet local talent.</h1>
          <p className="sp-lede">
            Nonprofits and small businesses across Orange County post real work. Students read the briefs, apply with
            a short note, and build the thing. The matching is explained; the collaboration is human.
          </p>
          <div className="sp-byline">
            <span className="sp-bullet" />
            Edited by the Talent Bridge newsroom · Reporting from Costa Mesa
          </div>
          <div className="sp-cta-row">
            <Link to="/register?role=organization" className="sp-btn sp-btn-primary">Post a challenge</Link>
            <Link to="/register?role=student" className="sp-btn sp-btn-ghost">I'm a student</Link>
          </div>
        </div>

        <aside className="sp-sidebar">
          <h2 className="sp-sidebar-title">In this issue</h2>
          <ol className="sp-toc">
            <li><span>A1</span> How a volunteer schedule got built in six weeks</li>
            <li><span>A3</span> The donor dashboard that paid for itself</li>
            <li><span>B1</span> Mentors on what students want to learn next</li>
            <li><span>C1</span> Open briefs this month, in brief</li>
          </ol>
          <blockquote className="sp-pullquote">
            "We described what we needed in two paragraphs. Four weeks later we had a working app and three new friends."
            <cite>— Director, Habitat for Humanity OC</cite>
          </blockquote>
        </aside>
      </article>

      <section className="sp-section">
        <div className="sp-eyebrow">The method</div>
        <h2 className="sp-h2">Four steps, in order of appearance</h2>
        <div className="sp-rule" />
        <ol className="sp-steps">
          {STEPS.map((s) => (
            <li key={s.k}>
              <div className="sp-step-num">{s.k}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sp-closing">
        <div className="sp-closing-inner">
          <h2>Have a project that needs doing?</h2>
          <p>The AI drafts the brief. You approve it. A student team begins.</p>
          <Link to="/register?role=organization" className="sp-btn sp-btn-primary sp-btn-lg">Post a challenge</Link>
        </div>
        <div className="sp-colophon">
          Printed in Orange County · All briefs reviewed by a human editor · Subscriptions free for nonprofits
        </div>
      </section>
    </div>
  )
}

const sundayPaperCss = `
.sp-root {
  --ink: #16130d;
  --paper: #f5efe3;
  --paper-2: #ede4d1;
  --rule: #16130d;
  --accent: #a3271a;
  --muted: #5c564a;
  background: var(--paper);
  color: var(--ink);
  font-family: "Source Serif 4", Georgia, serif;
  min-height: 100%;
}
.sp-root a { color: inherit; text-decoration: none; }
.sp-root a.sp-btn-primary { color: var(--paper); }
.sp-root a.sp-btn-ghost { color: var(--ink); }

.sp-masthead { max-width: 1100px; margin: 0 auto; padding: 32px 24px 20px; border-bottom: 1px solid var(--rule); }
.sp-dateline {
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  font-family: "Figtree", sans-serif; font-size: 12px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--muted);
  padding-bottom: 12px; border-bottom: 1px solid var(--rule);
}
.sp-nameplate {
  font-family: "Fraunces", serif; font-weight: 900; font-size: clamp(48px, 10vw, 112px);
  letter-spacing: -0.02em; line-height: 0.9; margin-top: 16px; text-align: center;
}
.sp-subhead {
  text-align: center; font-style: italic; margin-top: 10px; color: var(--muted);
  font-size: 15px;
}

.sp-hero {
  max-width: 1100px; margin: 0 auto; padding: 32px 24px;
  display: grid; grid-template-columns: 2fr 1fr; gap: 40px;
  border-bottom: 1px solid var(--rule);
}
.sp-hero-text h1 {
  font-family: "Fraunces", serif; font-weight: 700; font-size: clamp(40px, 6vw, 76px);
  line-height: 1.02; letter-spacing: -0.02em; margin: 10px 0 20px;
  text-wrap: balance;
}
.sp-kicker {
  font-family: "Figtree", sans-serif; font-size: 12px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--accent); font-weight: 600;
}
.sp-lede { font-size: 20px; line-height: 1.5; max-width: 56ch; }
.sp-byline {
  margin-top: 18px; font-family: "Figtree", sans-serif; font-size: 13px;
  color: var(--muted); display: flex; align-items: center; gap: 10px;
}
.sp-bullet { display: inline-block; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }
.sp-cta-row { margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap; }
.sp-btn {
  display: inline-block; padding: 12px 20px; text-decoration: none;
  font-family: "Figtree", sans-serif; font-weight: 600; font-size: 15px;
  border: 1px solid var(--ink); border-radius: 2px;
}
.sp-btn-primary { background: var(--ink); color: var(--paper); }
.sp-btn-primary:hover { background: var(--accent); border-color: var(--accent); }
.sp-btn-ghost { background: transparent; color: var(--ink); }
.sp-btn-ghost:hover { background: var(--paper-2); }
.sp-btn-lg { padding: 16px 28px; font-size: 16px; }

.sp-sidebar {
  border-left: 1px solid var(--rule); padding-left: 28px; min-width: 0;
}
.sp-sidebar-title {
  font-family: "Fraunces", serif; font-size: 22px; font-weight: 700;
  margin: 4px 0 14px; border-bottom: 2px solid var(--ink); padding-bottom: 8px;
}
.sp-toc { list-style: none; padding: 0; margin: 0 0 24px; }
.sp-toc li {
  display: grid; grid-template-columns: 36px 1fr; gap: 10px; padding: 10px 0;
  border-bottom: 1px dotted var(--muted); font-size: 15px;
}
.sp-toc li span {
  font-family: "Figtree", sans-serif; font-weight: 700; color: var(--accent);
  font-size: 12px; letter-spacing: 0.08em; align-self: center;
}
.sp-pullquote {
  margin: 0; padding: 14px 0 0; border-top: 3px double var(--ink);
  font-family: "Fraunces", serif; font-size: 18px; font-style: italic; line-height: 1.4;
}
.sp-pullquote cite {
  display: block; margin-top: 12px; font-family: "Figtree", sans-serif;
  font-style: normal; font-size: 12px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted);
}

.sp-section { max-width: 1100px; margin: 0 auto; padding: 48px 24px; }
.sp-eyebrow {
  font-family: "Figtree", sans-serif; font-size: 12px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent); font-weight: 700;
}
.sp-h2 {
  font-family: "Fraunces", serif; font-size: clamp(28px, 4vw, 44px); font-weight: 700;
  letter-spacing: -0.01em; margin: 8px 0 14px; text-wrap: balance;
}
.sp-rule {
  height: 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink);
  margin: 10px 0 32px; padding: 2px 0;
}
.sp-steps {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px;
  border-top: 1px solid var(--rule); padding-top: 32px;
}
.sp-steps li { border-top: 2px solid var(--ink); padding-top: 14px; }
.sp-step-num {
  font-family: "Fraunces", serif; font-weight: 900; font-size: 44px;
  line-height: 1; color: var(--accent); letter-spacing: -0.02em;
}
.sp-steps h3 {
  font-family: "Fraunces", serif; font-size: 20px; font-weight: 600; margin: 12px 0 8px;
}
.sp-steps p { color: var(--muted); font-size: 15px; line-height: 1.5; margin: 0; }

.sp-closing {
  background: var(--paper-2); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  padding: 48px 24px; text-align: center;
}
.sp-closing-inner { max-width: 760px; margin: 0 auto; }
.sp-closing h2 {
  font-family: "Fraunces", serif; font-size: clamp(28px, 4vw, 44px); font-weight: 700;
  letter-spacing: -0.01em; margin: 0 0 10px; text-wrap: balance;
}
.sp-closing p { margin: 0 0 24px; font-size: 18px; color: var(--muted); }
.sp-colophon {
  max-width: 760px; margin: 36px auto 0; padding-top: 20px; border-top: 1px solid var(--muted);
  font-family: "Figtree", sans-serif; font-size: 12px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--muted); text-align: center;
}

@media (max-width: 820px) {
  .sp-hero { grid-template-columns: 1fr; }
  .sp-sidebar { border-left: none; padding-left: 0; border-top: 1px solid var(--rule); padding-top: 24px; }
}
`
