import { Link } from 'react-router'

const STEPS = [
  { k: 1, title: 'Pin your challenge', body: "Tell us what you need in plain words. We'll handle the rest.", color: 'yellow', tilt: -1.4 },
  { k: 2, title: 'The AI drafts a brief', body: 'Objectives, deliverables, suggested skills, a reasonable timeline.', color: 'pink', tilt: 1.1 },
  { k: 3, title: 'Students raise a hand', body: 'Each match comes with the actual reasons, not just a score.', color: 'blue', tilt: -0.6 },
  { k: 4, title: 'The team gets going', body: 'You pick who joins. The project begins the following week.', color: 'green', tilt: 1.6 },
]

const OPEN_PROJECTS = [
  { title: 'Volunteer sign-up app', org: 'Habitat for Humanity OC', tags: ['React', 'Node', 'Design'], tilt: -1.8 },
  { title: 'Donor impact dashboard', org: 'OC Food Share', tags: ['Data', 'Charts', 'Python'], tilt: 1.4 },
  { title: 'Accessibility audit + fixes', org: 'Youth Mentors of OC', tags: ['A11y', 'QA', 'CSS'], tilt: -0.8 },
]

export default function BulletinBoard() {
  return (
    <div className="bb-root">
      <style>{bulletinCss}</style>

      <section className="bb-hero">
        <div className="bb-hero-card bb-paper">
          <span className="bb-pin bb-pin-red" />
          <div className="bb-stamp">Community · 2026</div>
          <h1>
            Local <em>challenges</em>,<br />
            meet local <em>talent</em>.
          </h1>
          <p>
            Nonprofits and small businesses post real work. Students bring the skills.
            Mentors keep the ship on course. This is the board where it starts.
          </p>
          <div className="bb-cta-row">
            <Link to="/register?role=organization" className="bb-btn bb-btn-primary">Post a challenge</Link>
            <Link to="/register?role=student" className="bb-btn bb-btn-ghost">Find a project</Link>
          </div>
          <div className="bb-tape bb-tape-tl" />
          <div className="bb-tape bb-tape-br" />
        </div>

        <div className="bb-flyer bb-flyer-note">
          <span className="bb-pin bb-pin-blue" />
          <div className="bb-handwritten">
            "Pinned my project on Monday.<br />
            Had three applicants by Friday.<br />
            Shipped in six weeks."
          </div>
          <div className="bb-flyer-sig">— Dir., Habitat OC</div>
        </div>
      </section>

      <section className="bb-section">
        <div className="bb-section-head">
          <h2>How the board works</h2>
          <span className="bb-section-rule" />
        </div>
        <div className="bb-steps">
          {STEPS.map((s) => (
            <div key={s.k} className={`bb-flyer bb-flyer-${s.color}`} style={{ transform: `rotate(${s.tilt}deg)` }}>
              <span className={`bb-pin bb-pin-${s.color === 'yellow' ? 'red' : s.color}`} />
              <div className="bb-step-num">{String(s.k).padStart(2, '0')}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bb-section">
        <div className="bb-section-head">
          <h2>Open briefs this month</h2>
          <span className="bb-section-rule" />
        </div>
        <div className="bb-flyers">
          {OPEN_PROJECTS.map((p) => (
            <div key={p.title} className="bb-flyer bb-flyer-open" style={{ transform: `rotate(${p.tilt}deg)` }}>
              <span className="bb-pin bb-pin-red" />
              <div className="bb-stamp bb-stamp-sm">Open</div>
              <h3>{p.title}</h3>
              <div className="bb-flyer-org">{p.org}</div>
              <div className="bb-tags">
                {p.tags.map((t) => (
                  <span key={t} className="bb-tag">{t}</span>
                ))}
              </div>
              <div className="bb-tear" aria-hidden>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i}>info@{i + 1}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bb-closing">
        <div className="bb-flyer bb-flyer-closing">
          <span className="bb-pin bb-pin-red" />
          <h2>Pin your project today.</h2>
          <p>Takes about ten minutes. Costs nothing.</p>
          <Link to="/register?role=organization" className="bb-btn bb-btn-primary bb-btn-lg">Post a challenge</Link>
        </div>
      </section>
    </div>
  )
}

const bulletinCss = `
.bb-root {
  --cork: #c99a68;
  --cork-dark: #a37648;
  --ink: #2b2320;
  --paper: #fcf7ea;
  --paper-pink: #fcd8d0;
  --paper-blue: #cfe3f0;
  --paper-green: #d9e8c6;
  --paper-yellow: #fef28a;
  --pin-red: #c2362b;
  --pin-blue: #2b6cb0;
  --pin-green: #3f7a3a;
  --tape: rgba(255,245,180,0.75);
  background: var(--cork);
  background-image:
    radial-gradient(circle at 20% 30%, rgba(80,50,20,0.18) 0 2px, transparent 3px),
    radial-gradient(circle at 70% 60%, rgba(80,50,20,0.15) 0 2px, transparent 3px),
    radial-gradient(circle at 40% 80%, rgba(80,50,20,0.12) 0 2px, transparent 3px),
    radial-gradient(circle at 90% 20%, rgba(80,50,20,0.14) 0 2px, transparent 3px),
    radial-gradient(circle at 10% 90%, rgba(80,50,20,0.10) 0 2px, transparent 3px);
  background-size: 220px 220px, 180px 180px, 260px 260px, 200px 200px, 240px 240px;
  color: var(--ink);
  font-family: "Figtree", system-ui, sans-serif;
  min-height: 100%;
  padding: 24px 16px 80px;
}

.bb-hero {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr; gap: 36px;
  padding: 40px 0;
}

.bb-paper, .bb-flyer {
  position: relative; background: var(--paper); border-radius: 2px;
  padding: 32px 28px; box-shadow: 2px 6px 18px rgba(30,20,10,0.35), inset 0 0 0 1px rgba(0,0,0,0.03);
}

.bb-hero-card {
  transform: rotate(-0.8deg);
  background:
    repeating-linear-gradient(0deg, transparent 0 23px, rgba(0,0,0,0.04) 23px 24px),
    var(--paper);
}
.bb-hero-card h1 {
  font-family: "Fraunces", serif; font-weight: 700; font-size: clamp(42px, 7vw, 72px);
  line-height: 1; letter-spacing: -0.02em; margin: 10px 0 20px; text-wrap: balance;
}
.bb-hero-card h1 em { font-style: italic; color: var(--pin-red); font-weight: 500; }
.bb-hero-card p { font-size: 18px; line-height: 1.5; max-width: 50ch; margin: 0; }

.bb-flyer-note {
  transform: rotate(2.4deg); align-self: start;
  background: var(--paper-yellow); padding: 28px 24px;
}
.bb-handwritten {
  font-family: "Caveat", cursive; font-size: 22px; line-height: 1.3; color: var(--ink);
}
.bb-flyer-sig {
  margin-top: 16px; font-family: "Patrick Hand", cursive; font-size: 16px; color: #6b5a2b;
}

.bb-pin {
  position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
  width: 20px; height: 20px; border-radius: 50%;
  box-shadow: inset -3px -3px 4px rgba(0,0,0,0.3), 1px 2px 4px rgba(0,0,0,0.35);
}
.bb-pin-red { background: radial-gradient(circle at 35% 30%, #e67266, var(--pin-red) 70%); }
.bb-pin-blue { background: radial-gradient(circle at 35% 30%, #68a3d6, var(--pin-blue) 70%); }
.bb-pin-green { background: radial-gradient(circle at 35% 30%, #7fb374, var(--pin-green) 70%); }

.bb-tape {
  position: absolute; width: 72px; height: 22px; background: var(--tape);
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.bb-tape-tl { top: -8px; left: 24px; transform: rotate(-6deg); }
.bb-tape-br { bottom: -8px; right: 36px; transform: rotate(4deg); }

.bb-stamp {
  display: inline-block; padding: 4px 10px; border: 1.5px solid var(--pin-red);
  color: var(--pin-red); font-weight: 700; letter-spacing: 0.12em;
  font-size: 11px; text-transform: uppercase; border-radius: 2px;
  transform: rotate(-2deg); margin-bottom: 6px;
}
.bb-stamp-sm { font-size: 10px; padding: 2px 7px; }

.bb-cta-row { margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap; }
.bb-btn {
  display: inline-block; padding: 12px 20px; text-decoration: none;
  font-weight: 700; font-size: 15px; border-radius: 999px;
  border: 2px solid var(--ink); background: var(--paper); color: var(--ink);
}
.bb-btn-primary { background: var(--pin-red); color: var(--paper); border-color: var(--pin-red); }
.bb-btn-primary:hover { background: #a0241b; border-color: #a0241b; }
.bb-btn-ghost:hover { background: #f0e9d4; }
.bb-btn-lg { padding: 14px 26px; font-size: 16px; }

.bb-section { max-width: 1100px; margin: 24px auto 0; padding: 40px 0; }
.bb-section-head {
  display: flex; align-items: center; gap: 20px;
  background: var(--paper); padding: 10px 20px; border-radius: 2px;
  transform: rotate(-0.4deg); width: fit-content;
  box-shadow: 2px 4px 10px rgba(30,20,10,0.3);
  margin-bottom: 24px;
}
.bb-section-head h2 {
  font-family: "Fraunces", serif; font-weight: 700; font-size: 28px; margin: 0;
}
.bb-section-rule { flex: 1; height: 2px; background: var(--ink); min-width: 40px; }

.bb-steps {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px;
}
.bb-flyer-yellow { background: var(--paper-yellow); }
.bb-flyer-pink { background: var(--paper-pink); }
.bb-flyer-blue { background: var(--paper-blue); }
.bb-flyer-green { background: var(--paper-green); }
.bb-step-num {
  font-family: "Fraunces", serif; font-weight: 900; font-size: 44px; line-height: 1;
  color: var(--pin-red); letter-spacing: -0.03em;
}
.bb-steps h3 {
  font-family: "Fraunces", serif; font-size: 20px; font-weight: 600; margin: 10px 0 6px;
}
.bb-steps p { margin: 0; font-size: 15px; line-height: 1.45; color: #3b322d; }

.bb-flyers {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px;
}
.bb-flyer-open h3 {
  font-family: "Fraunces", serif; font-size: 22px; font-weight: 700; margin: 6px 0 4px;
}
.bb-flyer-org { color: #6a5c54; font-size: 14px; margin-bottom: 14px; }
.bb-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
.bb-tag {
  background: var(--ink); color: var(--paper); font-size: 11px; padding: 3px 9px;
  border-radius: 999px; letter-spacing: 0.04em; font-weight: 600;
}
.bb-tear {
  display: grid; grid-template-columns: repeat(7, 1fr);
  border-top: 1px dashed #a89a8a; padding-top: 10px;
}
.bb-tear span {
  display: block; font-family: "Patrick Hand", cursive; text-align: center;
  font-size: 11px; color: #7a6b5e; border-right: 1px dashed #c3b3a0;
  padding: 2px 0; line-height: 1.1;
}
.bb-tear span:last-child { border-right: none; }

.bb-closing { max-width: 760px; margin: 60px auto 0; }
.bb-flyer-closing { background: var(--paper-pink); text-align: center; padding: 44px 28px; transform: rotate(-0.6deg); }
.bb-flyer-closing h2 {
  font-family: "Fraunces", serif; font-weight: 700; font-size: clamp(28px, 4vw, 42px); margin: 10px 0 10px;
}
.bb-flyer-closing p { margin: 0 0 22px; font-size: 17px; color: #4b3f3b; }

@media (max-width: 820px) {
  .bb-hero { grid-template-columns: 1fr; }
}
`
